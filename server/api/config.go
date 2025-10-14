package api

import (
	"gorm.io/gorm"

	"xcontrol/server/internal/service"
)

// ConfigureServiceDB configures the internal service database connection.
func ConfigureServiceDB(db *gorm.DB) {
	service.SetDB(db)
}
