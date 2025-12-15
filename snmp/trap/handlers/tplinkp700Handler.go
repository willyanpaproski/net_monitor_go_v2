package handlers

const (
	P7000_BASE_OID = "1.3.6.1.4.1.11863"
)

type TPLinkP7000TrapHandler struct {
	rfcHandler *RFCTrapHandler
}

func NewTPLinkP7000TrapHandler() *TPLinkP7000TrapHandler {
	return &TPLinkP7000TrapHandler{
		rfcHandler: NewRFCTrapHandler(),
	}
}
