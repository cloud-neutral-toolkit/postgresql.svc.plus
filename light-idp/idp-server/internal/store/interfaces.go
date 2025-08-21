package store

import (
	"errors"

	"light-idp/internal/models"
)

var ErrNotFound = errors.New("not found")

type UserStore interface {
	Create(models.User) error
	Get(id string) (models.User, error)
}
