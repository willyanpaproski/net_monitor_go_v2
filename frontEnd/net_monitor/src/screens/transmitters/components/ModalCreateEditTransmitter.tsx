import AddBox from "@mui/icons-material/AddBox";
import Close from "@mui/icons-material/Close";
import { useEffect } from "react";
import { useCreateTransmitter, useEditTransmitter, type Transmitter } from "../../../api/Transmitters";
import { useForm } from "../../../hooks/useForm";
import { useI18n } from "../../../hooks/usei18n";
import { useTransmitterSchema } from "../../../schemas/Transmitter";
import { ModalOverlay } from "../../../components/ModalOverlay";
import { ModalContainer } from "../../../components/ModalContainer";
import { Button, FormLabel, Grid, MenuItem, OutlinedInput, Select, Switch, TextField } from "@mui/material";
import { FormGrid } from "../../../components/FormGrid";

type ModalCreateEditTransmitterProps = {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    transmitter?: Transmitter;
}

export function ModalCreateEditTransmitter({ isVisible, setIsVisible, transmitter }: ModalCreateEditTransmitterProps) {
    const { t } = useI18n();
    const createTransmitterMutation = useCreateTransmitter();
    const editTransmitterMutation = useEditTransmitter();
    const transmitterSchema = useTransmitterSchema();

    const defaultFormData = {
        active: true,
        integration: "huawei" as const,
        name: "",
        ipAddress: "",
        accessUser: "",
        accessPassword: "",
        snmpCommunity: "",
        snmpPort: "",
        description: ""
    }

    const { formData, setFormData, handleChange, handleSelectChange, handleSwitchChange, isValid, errors, setDefault } = useForm(defaultFormData, ["name", "integration", "ipAddress", "snmpCommunity", "snmpPort"], transmitterSchema);

    useEffect(() => {
        if (transmitter) {
            setFormData({
                active: transmitter.active,
                integration: transmitter.integration,
                name: transmitter.name,
                ipAddress: transmitter.ipAddress,
                accessUser: transmitter.accessUser,
                accessPassword: transmitter.accessPassword,
                snmpCommunity: transmitter.snmpCommunity,
                snmpPort: transmitter.snmpPort,
                description: transmitter.description
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [transmitter, setFormData]);

    useEffect(() => {
        if (createTransmitterMutation.isSuccess) {
            setDefault();
            createTransmitterMutation.reset();
            setIsVisible(false);
        }
        if (editTransmitterMutation.isSuccess) {
            setDefault();
            editTransmitterMutation.reset();
            setIsVisible(false);
        }
    }, [createTransmitterMutation.isSuccess, editTransmitterMutation.isSuccess]);

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
                        <FormLabel htmlFor="active">{t('transmitters.createForm.fields.active')}</FormLabel>
                        <Switch 
                            name="active"
                            checked={formData.active}
                            onChange={handleSwitchChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="integration">{t('transmitters.createForm.fields.integration')}</FormLabel>
                        <Select 
                            id="integration"
                            name="integration"
                            size="small"
                            value={formData.integration}
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="huawei">Huawei</MenuItem>
                            <MenuItem value="datacom">Datacom</MenuItem>
                            <MenuItem value="zte">ZTE</MenuItem>
                            <MenuItem value="think">Think</MenuItem>
                        </Select>
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="name">{t('transmitters.createForm.fields.name')}</FormLabel>
                        <OutlinedInput 
                            id="name"
                            name="name"
                            size="small"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="ipAddress">{t('transmitters.createForm.fields.ipAddress')}</FormLabel>
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
                        <FormLabel htmlFor="accessUser">{t('transmitters.createForm.fields.accessUser')}</FormLabel>
                        <OutlinedInput 
                            id="accessUser"
                            name="accessUser"
                            size="small"
                            value={formData.accessUser}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="accessPassword">{t('transmitters.createForm.fields.accessPassword')}</FormLabel>
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
                        <FormLabel htmlFor="snmpCommunity">{t('transmitters.createForm.fields.snmpCommunity')}</FormLabel>
                        <OutlinedInput 
                            id="snmpCommunity"
                            name="snmpCommunity"
                            size="small"
                            value={formData.snmpCommunity}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="snmpPort">{t('transmitters.createForm.fields.snmpPort')}</FormLabel>
                        <OutlinedInput 
                            id="snmpPort"
                            name="snmpPort"
                            size="small"
                            value={formData.snmpPort}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 12 }}>
                        <FormLabel htmlFor="description">{t('transmitters.createForm.fields.description')}</FormLabel>
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
                        onClick={() => transmitter ? editTransmitterMutation.mutate({
                                ...formData, 
                                id: transmitter.id,
                                created_at: transmitter.created_at,
                                updated_at: transmitter.updated_at
                            }) : createTransmitterMutation.mutate(formData)}
                    >
                        {transmitter ? t('transmitters.createForm.save') : t('transmitters.createForm.create')}
                    </Button>
                </Grid>
            </ModalContainer>
        </ModalOverlay>
    );
}