package models

type NetworkDevice interface {
	GetID() string
	GetName() string
	GetIP() string
	GetCommunity() string
	GetPort() string
}

func (r *Roteador) GetID() string        { return r.ID.Hex() }
func (r *Roteador) GetName() string      { return r.Name }
func (r *Roteador) GetIP() string        { return r.IPAddress }
func (r *Roteador) GetCommunity() string { return r.SnmpCommunity }
func (r *Roteador) GetPort() string      { return r.SnmpPort }

func (t *TransmissorFibra) GetID() string        { return t.ID.Hex() }
func (t *TransmissorFibra) GetName() string      { return t.Name }
func (t *TransmissorFibra) GetIP() string        { return t.IPAddress }
func (t *TransmissorFibra) GetCommunity() string { return t.SnmpCommunity }
func (t *TransmissorFibra) GetPort() string      { return t.SnmpPort }

func (s *SwitchRede) GetID() string        { return s.ID.Hex() }
func (s *SwitchRede) GetName() string      { return s.Name }
func (s *SwitchRede) GetIP() string        { return s.IPAddress }
func (s *SwitchRede) GetCommunity() string { return s.SnmpCommunity }
func (s *SwitchRede) GetPort() string      { return s.SnmpPort }
