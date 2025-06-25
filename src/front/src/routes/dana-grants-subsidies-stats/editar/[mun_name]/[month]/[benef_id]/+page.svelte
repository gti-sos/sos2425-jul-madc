<script>
    // @ts-nocheck
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import { 
        Button, 
        Table, 
        Container,
        Row,
        Col,
        Modal,
        ModalBody,
        ModalHeader,
        ModalFooter,
        Form,
        FormGroup,
        Input,
        Label,
        Card,
        CardBody,
        CardHeader,
        Collapse,
        Alert, 
    
    } from '@sveltestrap/sveltestrap';
    import { fade, slide } from "svelte/transition";
    import { goto, replaceState } from '$app/navigation';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';

    const params = get(page).params;
    const munNameParam= params.mun_name;  
    const monthParam= params.month;
    const benefIDParam = params.benef_id;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats";
    let queryURL="";

    let currentAid = null;
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;
    

    if (dev) API = DEVEL_HOST + API;

    async function getAid(){
        let url = `${API}/${munNameParam}/${monthParam}/${benefIDParam}`;
        //console.log(url);
    
        try {
            const res = await fetch(url);
        
            if (res.status === 404) {
                showAlert("No se ha encontrado la ayuda especificada", "danger");
                return null;
            }
        
            if (res.status === 500) {
                showAlert("Error interno del servidor", "danger");
                return null;
            }
        
            const data = await res.json();
            currentAid= data;
        
        }catch (error) {
            showAlert("No se pudo conectar con el servidor", "danger");
            return null;
        }
    }

    async function updateAid() {
        try {
            const res = await fetch(`${API}/${currentAid.mun_name}/${currentAid.month}/${currentAid.benef_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentAid),
            });
            //console.log(`${API}/${currentAid.mun_name}/${currentAid.month}/${currentAid.benef_id}`);

            if (res.status==401) {
                showAlert("No está autorizado para realizar esta operación", "danger");
                return;
            }

            if (res.status===400) {
                showAlert("El cuerpo de la petición está vacío o mal formado", "danger");
                return;
            }

            if (res.status===404) {
                showAlert(`Recurso no encontrado para {municipio: ${currentAid.mun_name}, mes: ${currentAid.month}, benefId: ${currentAid.benef_id}}`, "danger");
                return;
            }
            if (res.status==500) {
                showAlert("Error interno del servidor", "danger");
                return;
            }

            showAlert("Subvención actualizada con éxito", "success");
            setTimeout(() => goto("/dana-grants-subsidies-stats"), 1500);
        } catch (error) {
            showAlert("Error de conexión al actualizar la subvención", "danger");
        }
    }

    function showAlert(message, type) {
        alertMessage = message;
        alertType = type;
        alertVisible = true;
        setTimeout(() => {
            alertVisible = false;
        }, 3000);
    }

    onMount(getAid);    
</script>

<style>
    .alert-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
    }

</style>

<svelte:head>
        <title>Editar {currentAid!==null? currentAid.benef_id: ""}</title>
</svelte:head>

<Container fluid>
    <!-- Alerta para mensajes -->
        {#if alertVisible}
            <div class="alert-container" transition:fade>
                <Alert color={alertType} isOpen={alertVisible} toggle={() => alertVisible = false}>
                    {alertMessage}
                </Alert>
            </div>
        {/if}
</Container>

    <Card style="padding: 0 13.3333dvw;">
        <CardHeader>
            <h3>Editar subvención</h3>
        </CardHeader>
        <CardBody>
            {#if currentAid}
                <Form>
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-year">Año</Label>
                                <Input type="number" name="edit-year" id="edit-year" min="1900" bind:value={currentAid.year} />
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label>Mes</Label>
                                <p>{currentAid.month}</p> 
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-grant_date">Fecha de concesión</Label>
                                <Input type="text" name="edit-grant_date" id="edit-grant_date" bind:value={currentAid.grant_date}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-aid_type">Tipo de ayuda</Label>
                                <datalist id="edit-aid_type_list">
                                    <option value="SUBVENCIÓN y ENTREGA DINERARIA SIN CONTRAPRESTACIÓN">SUBVENCIÓN y ENTREGA DINERARIA SIN CONTRAPRESTACIÓN</option>
                                </datalist>
                                
                                <Input type="text" name="edit-aid_type" id="edit-aid_type" list="edit-aid_type_list" bind:value={currentAid.aid_type}>
                                    
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-grantor">Institución Otorgante</Label>
                                <Input type="text" name="edit-grantor" id="edit-grantor" bind:value={currentAid.grantor}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-benef_id">ID Beneficiario</Label>
                                <Input type="text" name="edit-benef_id" id="edit-benef_id" bind:value={currentAid.benef_id}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-benef_name">Beneficiario</Label>
                                <Input type="text" name="edit-benef_name" id="edit-benef_name" bind:value={currentAid.benef_name}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-benef_type">Tipo Beneficiario</Label>
                                <datalist id="edit-benef_type_list">
                                    <option value="PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA">PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA</option>
                                    <option value="PERSONAS JURÍDICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA">PERSONAS JURÍDICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA</option>
                                    <option value="PERSONAS FÍSICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA">PERSONAS FÍSICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA</option>
                                </datalist>
                                <Input type="text" name="edit-benef_type" id="edit-benef_type" list="edit-benef_type_list" placeholder="A12345678" bind:value={currentAid.benef_type}>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-region_name">Región</Label>
                                <Input type="text" name="edit-region_name" id="edit-region_name" bind:value={currentAid.region_name}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-prov_name">Provincia</Label>
                                <datalist id="edit-prov_name_list">
                                    <option value="Alicante">Alicante</option>
                                    <option value="Castellón">Castellón</option>
                                    <option value="Valencia">Valencia</option>
                                </datalist>
                                <Input type="text" name="edit-prov_name" id="edit-prov_name" list="edit-prov_name_list" bind:value={currentAid.prov_name}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label>Municipio</Label>
                                <p>{currentAid.mun_name}</p>
                            </FormGroup>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-purpose">Propósito</Label>
                                <Input type="text" name="edit-purpose" id="edit-purpose" bind:value={currentAid.purpose}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-fund_type">Tipo Financiación</Label>
                                <datalist id="edit-fund_type_list">
                                    <option value="Autonómica">Autonómica</option>
                                    <option value="Estatal">Estatal</option>
                                    <option value="Europea">Europea</option>
                                    <option value="Autonómica/Estatal">Autonómica/Estatal</option>
                                    <option value="Autonómica/Europea">Autonómica/Europea</option>
                                    <option value="Autonómica/Europea">Europea/Estatal</option>
                                </datalist>
                                <Input type="text" name="edit-fund_type" id="edit-fund_type" list="edit-fund_type_list" bind:value={currentAid.fund_type}>
                                    
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-fund_eu">Financiación Europea</Label>
                                <Input type="number" name="edit-fund_eu" id="edit-fund_eu" min="0" bind:value={currentAid.fund_eu}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-fund_state">Financiación Estatal</Label>
                                <Input type="number" name="edit-fund_state" id="edit-fund_state" min="0" bind:value={currentAid.fund_state}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-fund_regional">Financiación Regional</Label>
                                <Input type="number" name="edit-fund_regional" id="edit-fund_regional" min="0" bind:value={currentAid.fund_regional}/>
                            </FormGroup>
                        </Col>                        
                    </Row>
                    
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-fund_local">Financiación Local</Label>
                                <Input type="number" name="edit-fund_local" id="edit-fund_local" min="0" bind:value={currentAid.fund_local}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-fund_other">Financiación Otros</Label>
                                <Input type="number" name="edit-fund_other" id="edit-fund_other" min="0" bind:value={currentAid.fund_other}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-amt_granted">Importe concedido</Label>
                                <Input type="number" name="edit-amt_granted" id="edit-amt_granted" min="0" bind:value={currentAid.amt_granted}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label for="edit-amt_paid">Importe pagado</Label>
                                <Input type="number" name="edit-amt_paid" id="edit-amt_paid" min="0" bind:value={currentAid.amt_paid}/>
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
            {/if}
        </CardBody>
        <Container>
            <Button color="secondary" on:click={goto("/dana-grants-subsidies-stats")} class="me-2">Cancelar</Button>
            <Button color="primary" on:click={updateAid}>Guardar cambios</Button>
        </Container>
    </Card>
