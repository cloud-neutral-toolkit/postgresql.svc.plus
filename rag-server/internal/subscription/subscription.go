package subscription

import "fmt"

func GenerateVLESS(id, host string) string {
	return fmt.Sprintf("vless://%s@%s", id, host)
}
