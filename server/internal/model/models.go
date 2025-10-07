package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID          string      `gorm:"type:uuid;primaryKey" json:"id"`
	Email       string      `json:"email"`
	Level       int         `json:"level"`
	Role        string      `json:"role"`
	Groups      StringArray `gorm:"type:jsonb" json:"groups"`
	Permissions StringArray `gorm:"type:jsonb" json:"permissions"`
	Active      bool        `json:"active"`
	Upload      int64       `json:"upload"`
	Download    int64       `json:"download"`
	ExpireAt    *time.Time  `json:"expire_at"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

type Node struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `json:"name"`
	Location  string    `json:"location"`
	Protocols string    `json:"protocols"`
	Address   string    `json:"address"`
	Available bool      `json:"available"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

const (
	LevelAdmin    = 0
	LevelOperator = 10
	LevelUser     = 20
)

const (
	RoleAdmin    = "admin"
	RoleOperator = "operator"
	RoleUser     = "user"
)

var (
	modelRoleToLevel = map[string]int{
		RoleAdmin:    LevelAdmin,
		RoleOperator: LevelOperator,
		RoleUser:     LevelUser,
	}
	modelLevelToRole = map[int]string{
		LevelAdmin:    RoleAdmin,
		LevelOperator: RoleOperator,
		LevelUser:     RoleUser,
	}
)

func (u *User) BeforeCreate(_ *gorm.DB) error {
	normalizeModelUser(u)
	return nil
}

func (u *User) BeforeSave(_ *gorm.DB) error {
	normalizeModelUser(u)
	return nil
}

func (u *User) AfterFind(_ *gorm.DB) error {
	normalizeModelUser(u)
	return nil
}

type StringArray []string

func (sa StringArray) Value() (driver.Value, error) {
	normalized := sa.normalized()
	if len(normalized) == 0 {
		return []byte("[]"), nil
	}
	return json.Marshal([]string(normalized))
}

func (sa *StringArray) Scan(value any) error {
	if sa == nil {
		return fmt.Errorf("StringArray receiver is nil")
	}
	if value == nil {
		*sa = nil
		return nil
	}
	switch v := value.(type) {
	case string:
		if strings.TrimSpace(v) == "" {
			*sa = nil
			return nil
		}
		var decoded []string
		if err := json.Unmarshal([]byte(v), &decoded); err != nil {
			return err
		}
		*sa = StringArray(decoded).normalized()
	case []byte:
		if len(v) == 0 {
			*sa = nil
			return nil
		}
		var decoded []string
		if err := json.Unmarshal(v, &decoded); err != nil {
			return err
		}
		*sa = StringArray(decoded).normalized()
	default:
		return fmt.Errorf("unsupported type %T for StringArray", value)
	}
	return nil
}

func (sa StringArray) normalized() StringArray {
	if len(sa) == 0 {
		return nil
	}
	result := make([]string, 0, len(sa))
	seen := make(map[string]struct{}, len(sa))
	for _, value := range sa {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			continue
		}
		if _, ok := seen[trimmed]; ok {
			continue
		}
		seen[trimmed] = struct{}{}
		result = append(result, trimmed)
	}
	if len(result) == 0 {
		return nil
	}
	return StringArray(result)
}

func normalizeModelUser(u *User) {
	if u == nil {
		return
	}

	normalizedRole := strings.ToLower(strings.TrimSpace(u.Role))
	if level, ok := modelRoleToLevel[normalizedRole]; ok {
		u.Role = normalizedRole
		u.Level = level
	} else if role, ok := modelLevelToRole[u.Level]; ok {
		u.Role = role
	} else {
		u.Role = RoleUser
		u.Level = LevelUser
	}

	u.Groups = u.Groups.normalized()
	u.Permissions = u.Permissions.normalized()
}
