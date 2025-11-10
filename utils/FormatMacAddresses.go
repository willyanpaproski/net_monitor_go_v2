package Utils

import (
	"fmt"
	"strings"
)

func FormatMacAddress(macBytes []byte) string {
	if len(macBytes) == 0 {
		return ""
	}

	parts := make([]string, len(macBytes))
	for i, b := range macBytes {
		parts[i] = fmt.Sprintf("%02x", b)
	}
	return strings.ToUpper(strings.Join(parts, ":"))
}
