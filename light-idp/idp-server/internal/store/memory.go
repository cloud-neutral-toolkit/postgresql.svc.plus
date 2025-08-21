package store

import "light-idp/internal/models"

type MemoryStore struct {
	users map[string]models.User
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{users: make(map[string]models.User)}
}

func (m *MemoryStore) Create(u models.User) error {
	m.users[u.ID] = u
	return nil
}

func (m *MemoryStore) Get(id string) (models.User, error) {
	u, ok := m.users[id]
	if !ok {
		return models.User{}, ErrNotFound
	}
	return u, nil
}

func (m *MemoryStore) SaveRefreshToken(id, token string) error {
	u, ok := m.users[id]
	if !ok {
		u = models.User{ID: id}
	}
	u.RefreshToken = token
	m.users[id] = u
	return nil
}

func (m *MemoryStore) RevokeRefreshToken(id string) error {
	u, ok := m.users[id]
	if !ok {
		return ErrNotFound
	}
	u.RefreshToken = ""
	m.users[id] = u
	return nil
}
