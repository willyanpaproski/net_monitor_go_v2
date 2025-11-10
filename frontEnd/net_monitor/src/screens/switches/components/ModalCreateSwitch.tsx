import { useEffect } from "react";
import { useCreateNetworkSwitch as useCreateNetworkSwitch, useEditNetworkSwitch, type NetworkSwitch } from "../../../api/Switches";
import { useForm } from "../../../hooks/useForm";
import { useI18n } from "../../../hooks/usei18n";
import { useNetworkSwitchSchema } from "../../../schemas/NetworkSwitch";
import { ModalOverlay } from "../../../components/ModalOverlay";
import { ModalContainer } from "../../../components/ModalContainer";
import AddBox from "@mui/icons-material/AddBox";
import Close from "@mui/icons-material/Close";
import { Button, FormLabel, Grid, MenuItem, OutlinedInput, Select, Switch, TextField } from "@mui/material";
import { FormGrid } from "../../../components/FormGrid";

type ModalCreateEditSwitchProps = {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    networkSwitch?: NetworkSwitch;
}

export function ModalCreateEditSwitch({ isVisible, setIsVisible, networkSwitch }: ModalCreateEditSwitchProps) {
    const { t } = useI18n();
    const createSwitchMutation = useCreateNetworkSwitch();
    const editSwitchMutation = useEditNetworkSwitch();
    const switchSchema = useNetworkSwitchSchema();

    const defaultFormData = {
        active: true,
        integration: "huawei",
        name: "",
        ipAddress: "",
        accessUser: "",
        accessPassword: "",
        snmpCommunity: "",
        snmpPort: "",
        description: ""
    }

    const { formData, setFormData, handleChange, handleSelectChange, handleSwitchChange, isValid, errors, setDefault } = useForm(defaultFormData, ["name", "integration", "ipAddress", "snmpCommunity", "snmpPort"], switchSchema);

    const updateData = {
        ...formData,
        id: networkSwitch?.id,
        created_at: networkSwitch?.created_at,
        updated_at: networkSwitch?.updated_at
    }

    useEffect(() => {
        if (networkSwitch) {
            setFormData({
                active: networkSwitch.active,
                integration: networkSwitch.integration,
                name: networkSwitch.name,
                ipAddress: networkSwitch.ipAddress,
                accessUser: networkSwitch.accessUser,
                accessPassword: networkSwitch.accessPassword,
                snmpCommunity: networkSwitch.snmpCommunity,
                snmpPort: networkSwitch.snmpPort,
                description: networkSwitch.description
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [networkSwitch, setFormData]);

    useEffect(() => {
        if (createSwitchMutation.isSuccess) {
            setDefault();
            createSwitchMutation.reset();
            setIsVisible(false);
        }
        if (editSwitchMutation.isSuccess) {
            setDefault();
            editSwitchMutation.reset();
            setIsVisible(false);
        }
    }, [createSwitchMutation.isSuccess, editSwitchMutation.isSuccess]);

    if (!isVisible) return null;
    
    return (
        <ModalOverlay>
            <ModalContainer
                modalHeight="90vh"
                modalMargin="16px"
                modalPadding="16px"
                modalWidth="800px"
            >
                <AddBox sx={{ fontSize: "2.5rem" }} />
                <Button sx={{
                    minWidth: "auto",
                    p: 1,
                    position: "absolute",
                    top: 8,
                    right: 8
                }} onClick={() => setIsVisible(false)}>
                    <Close sx={{ fontSize: "1.5rem" }} />
                </Button>
                <Grid container spacing={3} sx={{  
                    marginTop: 5
                }}>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="active">{t('switches.createForm.fields.active')}</FormLabel>
                        <Switch 
                            name="active"
                            checked={formData.active}
                            onChange={handleSwitchChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="integration">{t('switches.createForm.fields.integration')}</FormLabel>
                        <Select 
                            id="integration"
                            name="integration"
                            size="small"
                            value={formData.integration}
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="huawei">Huawei</MenuItem>
                            <MenuItem value="ciscoCatalist">Cisco Catalist</MenuItem>
                        </Select>
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="name">{t('switches.createForm.fields.name')}</FormLabel>
                        <OutlinedInput 
                            id="name"
                            name="name"
                            size="small"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="ipAddress">{t('switches.createForm.fields.ipAddress')}</FormLabel>
                        <OutlinedInput 
                            id="ipAddress"
                            name="ipAddress"
                            size="small"
                            value={formData.ipAddress}
                            onChange={handleChange}
                        />
                        {errors.ipAddress && formData.ipAddress !== "" && (
                            <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.ipAddress}</span>
                        )}
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="accessUser">{t('switches.createForm.fields.accessUser')}</FormLabel>
                        <OutlinedInput 
                            id="accessUser"
                            name="accessUser"
                            size="small"
                            value={formData.accessUser}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="accessPassword">{t('switches.createForm.fields.accessPassword')}</FormLabel>
                        <OutlinedInput 
                            id="accessPassword"
                            name="accessPassword"
                            type="password"
                            size="small"
                            value={formData.accessPassword}
                            onChange={handleChange}
                        />
                        {errors.accessPassword && formData.accessPassword !== "" && (
                            <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.accessPassword}</span>
                        )}
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="snmpCommunity">{t('switches.createForm.fields.snmpCommunity')}</FormLabel>
                        <OutlinedInput 
                            id="snmpCommunity"
                            name="snmpCommunity"
                            size="small"
                            value={formData.snmpCommunity}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="snmpPort">{t('switches.createForm.fields.snmpPort')}</FormLabel>
                        <OutlinedInput 
                            id="snmpPort"
                            name="snmpPort"
                            size="small"
                            value={formData.snmpPort}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 12 }}>
                        <FormLabel htmlFor="description">{t('switches.createForm.fields.description')}</FormLabel>
                        <TextField
                            id="description"
                            name="description"
                            size="small"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </FormGrid>
                </Grid>
                <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button 
                        disabled={!isValid} 
                        sx={{
                            "&.Mui-disabled": {
                                background: "#0C1017",
                                cursor: "not-allowed",
                                borderColor: "#05070A"
                            }
                        }}
                        variant="contained"
                        onClick={() => networkSwitch ? editSwitchMutation.mutate(updateData) : createSwitchMutation.mutate(formData)}
                    >
                        {networkSwitch ? t('routers.createForm.save') : t('routers.createForm.create')}
                    </Button>
                </Grid>
            </ModalContainer>
        </ModalOverlay>
    );
}