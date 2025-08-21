package ldap

import (
	gldap "github.com/go-ldap/ldap/v3"
	"light-idp/internal/models"
	"light-idp/internal/store"
)

type Config struct {
	URL      string
	BindDN   string
	Password string
	BaseDN   string
	Filter   string
}

func Sync(cfg Config, s store.UserStore) error {
	l, err := gldap.DialURL(cfg.URL)
	if err != nil {
		return err
	}
	defer l.Close()
	if cfg.BindDN != "" {
		if err := l.Bind(cfg.BindDN, cfg.Password); err != nil {
			return err
		}
	}
	search := gldap.NewSearchRequest(
		cfg.BaseDN,
		gldap.ScopeWholeSubtree, gldap.NeverDerefAliases, 0, 0, false,
		cfg.Filter,
		[]string{"uid", "mail"},
		nil,
	)
	sr, err := l.Search(search)
	if err != nil {
		return err
	}
	for _, entry := range sr.Entries {
		u := models.User{
			ID:    entry.GetAttributeValue("uid"),
			Email: entry.GetAttributeValue("mail"),
		}
		_ = s.Create(u)
	}
	return nil
}
