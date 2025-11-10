package interfaces

type NetworkDevice interface {
	GetID() string
	GetName() string
	GetIntegration() string
	GetIPAddress() string
	GetSnmpCommunity() string
	GetSnmpPort() string
	GetAccessUser() string
	GetAccessPassword() string
	IsActive() bool
}
