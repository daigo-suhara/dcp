package main

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

const authCookieName = "dcp_session"

var (
	errUserExists      = errors.New("user exists")
	errInvalidCreds    = errors.New("invalid credentials")
	errSessionNotFound = errors.New("session not found")
	errUserNotFound    = errors.New("user not found")
)

type authManager interface {
	Register(context.Context, string, string) (authUser, error)
	Login(context.Context, string, string) (authSession, error)
	Logout(context.Context, string) error
	CurrentUser(context.Context, string) (authUser, error)
}

type authUser struct {
	Username  string `json:"username"`
	CreatedAt string `json:"createdAt"`
}

type authSession struct {
	Token     string   `json:"token,omitempty"`
	Username  string   `json:"username"`
	ExpiresAt string   `json:"expiresAt"`
	User      authUser `json:"user,omitempty"`
}

type memoryAuthManager struct {
	mu       sync.Mutex
	users    map[string]storedUser
	sessions map[string]storedSession
}

type storedUser struct {
	Username     string
	Salt         string
	PasswordHash string
	CreatedAt    string
}

type storedSession struct {
	Token     string
	Username  string
	ExpiresAt time.Time
}

func newMemoryAuthManager() authManager {
	return &memoryAuthManager{
		users:    map[string]storedUser{},
		sessions: map[string]storedSession{},
	}
}

func (m *memoryAuthManager) Register(_ context.Context, username, password string) (authUser, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	username = normalizeUsername(username)
	if username == "" || password == "" {
		return authUser{}, fmt.Errorf("ユーザー名とパスワードは必須です")
	}
	if _, ok := m.users[username]; ok {
		return authUser{}, errUserExists
	}
	salt, err := randomToken(16)
	if err != nil {
		return authUser{}, err
	}
	user := storedUser{
		Username:     username,
		Salt:         salt,
		PasswordHash: hashPassword(salt, password),
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
	}
	m.users[username] = user
	return user.public(), nil
}

func (m *memoryAuthManager) Login(_ context.Context, username, password string) (authSession, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	username = normalizeUsername(username)
	user, ok := m.users[username]
	if !ok {
		return authSession{}, errInvalidCreds
	}
	if !comparePassword(user.Salt, user.PasswordHash, password) {
		return authSession{}, errInvalidCreds
	}
	token, err := randomToken(32)
	if err != nil {
		return authSession{}, err
	}
	exp := time.Now().UTC().Add(24 * time.Hour)
	m.sessions[token] = storedSession{Token: token, Username: username, ExpiresAt: exp}
	return authSession{
		Token:     token,
		Username:  username,
		ExpiresAt: exp.Format(time.RFC3339),
		User:      user.public(),
	}, nil
}

func (m *memoryAuthManager) Logout(_ context.Context, token string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.sessions, token)
	return nil
}

func (m *memoryAuthManager) CurrentUser(_ context.Context, token string) (authUser, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	session, ok := m.sessions[token]
	if !ok {
		return authUser{}, errSessionNotFound
	}
	if time.Now().UTC().After(session.ExpiresAt) {
		delete(m.sessions, token)
		return authUser{}, errSessionNotFound
	}
	user, ok := m.users[session.Username]
	if !ok {
		return authUser{}, errUserNotFound
	}
	return user.public(), nil
}

func (u storedUser) public() authUser {
	return authUser{Username: u.Username, CreatedAt: u.CreatedAt}
}

func normalizeUsername(value string) string {
	return sanitizeDNSLabel(strings.ToLower(strings.TrimSpace(value)))
}

func hashPassword(salt, password string) string {
	sum := sha256.Sum256([]byte(salt + ":" + password))
	return hex.EncodeToString(sum[:])
}

func comparePassword(salt, expectedHash, password string) bool {
	return hashPassword(salt, password) == expectedHash
}

func randomToken(length int) (string, error) {
	if length <= 0 {
		length = 32
	}
	buf := make([]byte, length)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

func authCookie(token string, secure bool) *http.Cookie {
	return &http.Cookie{
		Name:     authCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		MaxAge:   60 * 60 * 24,
	}
}

func clearAuthCookie(secure bool) *http.Cookie {
	cookie := authCookie("", secure)
	cookie.MaxAge = -1
	cookie.Expires = time.Unix(0, 0)
	return cookie
}
