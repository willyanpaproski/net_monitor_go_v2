import { Button, FormLabel, Grid, MenuItem, OutlinedInput, Select, Switch, TextField } from "@mui/material";
import AddBox from "@mui/icons-material/AddBox";
import Close from "@mui/icons-material/Close";
import { useI18n } from "../../../hooks/usei18n";
import { useForm } from "../../../hooks/useForm";
import { useCreateRouter, useEditRouter, type Router } from "../../../api/Routers";
import { useRouterSchema } from "../../../schemas/Router";
import { useEffect } from "react";
import { ModalOverlay } from "../../../components/ModalOverlay";
import { ModalContainer } from "../../../components/ModalContainer";
import { FormGrid } from "../../../components/FormGrid";

type ModalCreateEditRouterProps = {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    router?: Router | undefined;
}

export function ModalCreateEditRouter({ isVisible, setIsVisible, router }: ModalCreateEditRouterProps) {
    const { t } = useI18n();
    const createRouterMutation = useCreateRouter();
    const editRouterMutation = useEditRouter();
    const routerSchema = useRouterSchema();

    const defaultFormData = {
        active: true,
        integration: "mikrotik" as const,
        name: "",
        ipAddress: "",
        accessUser: "",
        accessPassword: "",
        snmpCommunity: "",
        snmpPort: "",
        description: ""
    };

    const { formData, setFormData, handleChange, handleSelectChange, handleSwitchChange, isValid, errors, setDefault } = useForm(defaultFormData, ["name", "integration", "ipAddress", "snmpCommunity", "snmpPort"], routerSchema);

    useEffect(() => {
        if (router) {
            setFormData ({
                active: router.active,
                integration: router.integration,
                name: router.name,
                ipAddress: router.ipAddress,
                accessUser: router.accessUser,
                accessPassword: router.accessPassword,
                snmpCommunity: router.snmpCommunity,
                snmpPort: router.snmpPort,
                description: router.description
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [router, setFormData]);

    useEffect(() => {
        if (createRouterMutation.isSuccess) {
            setDefault();
            createRouterMutation.reset();
            setIsVisible(false);
        }
        if (editRouterMutation.isSuccess) {
            setDefault();
            editRouterMutation.reset();
            setIsVisible(false);
        }
    }, [createRouterMutation.isSuccess, editRouterMutation.isSuccess]);

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
                        <FormLabel htmlFor="active">{t('routers.createForm.fields.active')}</FormLabel>
                        <Switch 
                            name="active"
                            checked={formData.active}
                            onChange={handleSwitchChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="integration">{t('routers.createForm.fields.integration')}</FormLabel>
                        <Select 
                            id="integration"
                            name="integration"
                            size="small"
                            value={formData.integration}
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="mikrotik">Mikrotik</MenuItem>
                            <MenuItem value="huawei">Huawei</MenuItem>
                            <MenuItem value="cisco">Cisco</MenuItem>
                        </Select>
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="name">{t('routers.createForm.fields.name')}</FormLabel>
                        <OutlinedInput 
                            id="name"
                            name="name"
                            size="small"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="ipAddress">{t('routers.createForm.fields.ipAddress')}</FormLabel>
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
                        <FormLabel htmlFor="accessUser">{t('routers.createForm.fields.accessUser')}</FormLabel>
                        <OutlinedInput 
                            id="accessUser"
                            name="accessUser"
                            size="small"
                            value={formData.accessUser}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="accessPassword">{t('routers.createForm.fields.accessPassword')}</FormLabel>
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
                        <FormLabel htmlFor="snmpCommunity">{t('routers.createForm.fields.snmpCommunity')}</FormLabel>
                        <OutlinedInput 
                            id="snmpCommunity"
                            name="snmpCommunity"
                            size="small"
                            value={formData.snmpCommunity}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="snmpPort">{t('routers.createForm.fields.snmpPort')}</FormLabel>
                        <OutlinedInput 
                            id="snmpPort"
                            name="snmpPort"
                            size="small"
                            value={formData.snmpPort}
                            onChange={handleChange}
                        />
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 12 }}>
                        <FormLabel htmlFor="description">{t('routers.createForm.fields.description')}</FormLabel>
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
                        onClick={() => router ? editRouterMutation.mutate({
                            ...formData,
                            id: router.id,
                            created_at: router.created_at,
                            updated_at: router.updated_at
                        }) : createRouterMutation.mutate(formData)}
                    >
                        {router ? t('routers.createForm.save') : t('routers.createForm.create')}
                    </Button>
                </Grid>
            </ModalContainer>
        </ModalOverlay>
    );
}