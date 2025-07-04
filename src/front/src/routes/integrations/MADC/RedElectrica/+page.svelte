<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>
<!-- svelte-ignore css_unused_selector -->
<style>
    .highcharts-figure,
    .highcharts-data-table table {
        min-width: 310px;
        max-width: 800px;
        margin: 1em auto;
    }

    #container {
        height: 500px;
    }

    .highcharts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #ebebeb;
        margin: 10px auto;
        text-align: center;
        width: 100%;
        max-width: 500px;
    }

    .highcharts-data-table caption {
        padding: 1em 0;
        font-size: 1.2em;
        color: #555;
    }

    .highcharts-data-table th {
        font-weight: 600;
        padding: 0.5em;
    }

    .highcharts-data-table td,
    .highcharts-data-table th,
    .highcharts-data-table caption {
        padding: 0.5em;
    }

    .highcharts-data-table thead tr,
    .highcharts-data-table tbody tr:nth-child(even) {
        background: #f8f8f8;
    }

    .highcharts-data-table tr:hover {
        background: #f1f7ff;
    }

    .highcharts-description {
        margin: 0.3rem 10px;
    }

    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        width: 100%;
    }

    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border-left-color: #09f;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error-message {
        color: #d9534f;
        text-align: center;
        padding: 20px;
        font-weight: bold;
    }
</style>


<script>
// @ts-nocheck

    import { onMount, tick} from "svelte";
    import { dev } from "$app/environment";
    import * as echarts from 'echarts';

    // @ts-ignore
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let loading = true;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats/All";

    if (dev) API = DEVEL_HOST + API;

    const valor= "https://demanda.ree.es/WSvisionaMovilesPeninsulaRest/resources/demandaGeneracionPeninsula?&curva=DEMANDAAU&fecha=2024-11-26";
    
    let HOSTRedElectrica = dev? "http://localhost:3000/ree-proxy": "https://sos2425-jul-madc.onrender.com/ree-proxy";
    let APIRedElectrica = HOSTRedElectrica + `/WSvisionaMovilesPeninsulaRest/resources/demandaGeneracionPeninsula?&curva=DEMANDAAU&fecha=2024-10-25`;    
    
    //Red Electrica
    let redElectrica = [];
    let aids = [];

    async function getAidsData() {
        try {
            let res = await fetch(API);
            let json = await res.json();

            json.forEach(obj => {
                if (!aids[obj.grant_date]) {
                    aids[obj.grant_date] = 1;
                } else {
                    aids[obj.grant_date] = aids[obj.grant_date] + 1;
                }
            });

            let diasExcl=["01-10-2024", "02-10-2024", "03-10-2024", "04-10-2024", "05-10-2024",
                "06-10-2024", "07-10-2024", "08-10-2024", "09-10-2024", "10-10-2024",
                "11-10-2024", "12-10-2024", "13-10-2024", "14-10-2024", "15-10-2024",
                "16-10-2024", "17-10-2024", "18-10-2024", "19-10-2024", "20-10-2024",
                "21-10-2024", "22-10-2024", "23-10-2024", "24-10-2024", "26-12-2025",
                "27-12-2025", "28-12-2025", "29-12-2025", "30-12-2025", "31-12-2025"];
            aids = Object.fromEntries(Object.entries(aids).filter(([key, value]) => value > 1 && !diasExcl.includes(key)));
            aids = Object.entries(aids).map(([key, value]) => ({ name: key, value: value }));
            aids= aids.sort((a, b) => a.name.localeCompare(b.name));
            //let numeros= Object.values(aids).map(obj=> obj.value);
            //console.log(numeros);
            console.log(aids);
        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function getRedElectricaData() {
        //let fechas=["2024-10-25", "2024-10-26"];      
        let fechas=["2024-10-25", "2024-10-26", "2024-10-27", "2024-10-28", "2024-10-29", "2024-10-30", "2024-10-31",
            "2024-11-01", "2024-11-02", "2024-11-03", "2024-11-04", "2024-11-05", "2024-11-06", "2024-11-07", "2024-11-08",
            "2024-11-09", "2024-11-10", "2024-11-11", "2024-11-12", "2024-11-13", "2024-11-14", "2024-11-15", "2024-11-16",
            "2024-11-17", "2024-11-18", "2024-11-19", "2024-11-20", "2024-11-21", "2024-11-22", "2024-11-23", "2024-11-24", 
            "2024-11-25", "2024-11-26", "2024-11-27", "2024-11-28", "2024-11-29", "2024-11-30",
            "2024-12-01", "2024-12-02", "2024-12-03", "2024-12-04", "2024-12-05", "2024-12-06", "2024-12-07", "2024-12-08",
            "2024-12-09", "2024-12-10", "2024-12-11", "2024-12-12", "2024-12-13", "2024-12-14", "2024-12-15", "2024-12-16",
            "2024-12-17", "2024-12-18", "2024-12-19", "2024-12-20", "2024-12-21", "2024-12-22", "2024-12-23", "2024-12-24",
            "2024-12-25"];
        try {
            for(let fecha of fechas){
                let url= HOSTRedElectrica + `/WSvisionaMovilesPeninsulaRest/resources/demandaGeneracionPeninsula?&curva=DEMANDAAU&fecha=${fecha}`;    
                
                let res = await fetch(url);
                let jsonString = (await res.text()).replace(`null({"valoresHorariosGeneracion":`, "").replace("});", "");
                let data = JSON.parse(jsonString);

                //console.log(res);
                //console.log(jsonString);
                //console.log(data);

                let max= obtenerMaximo(data.map(obj=> obj.eol));
                let fechastr= fecha.split("-");
                let date= fechastr[2]+"/"+fechastr[1]+"/"+fechastr[0];

                redElectrica.push({name: date, value: max});
            }
            console.log(redElectrica);

        } catch (error) {
            console.error("Error al cargar datos de red electrica:", error);
            showAlert("Error al cargar datos meteorológicos", "danger");
        }
    }

    async function renderChart() {
        await tick(); // <- asegura que el DOM esté renderizado antes de dibujar el gráfico
                
        let container= document.getElementById("container");
        let dias= aids.map(obj=> obj.name);

        Highcharts.chart('container', {
            chart: {
                zooming: {
                    type: 'xy'
                }
            },
            title: {
                text: 'Evolución Subvenciones y Potencia Eólica Diaria',
                align: 'left'
            },
            xAxis: [{
                categories: dias,
                crosshair: true,
                labels: {
                    step: 15,
                }
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} subv.',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                title: {
                    text: 'Subvenciones',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: 'Potencia Eólica',
                    style: {
                        color: Highcharts.getOptions().colors[3]
                    }
                },
                labels: {
                    format: '{value} MW',
                    style: {
                        color: Highcharts.getOptions().colors[3]
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true
            },
            legend: {
                align: 'left',
                verticalAlign: 'top'
            },
            series: [{
                name: 'Potencia Eólica',
                type: 'column',
                yAxis: 1,
                data: redElectrica.map(obj=> obj.value),
                color: Highcharts.getOptions().colors[3],
                tooltip: {
                    valueSuffix: ' MW'
                }

            }, {
                name: 'Subvenciones',
                type: 'spline',
                data: aids.map(obj=> obj.value),
                color: Highcharts.getOptions().colors[2],
                tooltip: {
                    valueSuffix: ' subv.'
                }
            }]
        });
    }

    async function processGraphs() {
        loading = true;
        await getAidsData();
        await getRedElectricaData();
        await renderChart();
        loading = false;
    }

    function obtenerMaximo(lista) {
        if (!Array.isArray(lista) || lista.length === 0) {
            throw new Error("La lista debe ser un array no vacío");
        }

        return lista.reduce((max, actual) => actual > max ? actual : max, lista[0]);
    }

onMount(() => {
    processGraphs();
});

    // @ts-ignore
    function showAlert(message, type) {
        alertMessage = message;
        alertType = type;
        alertVisible = true;
        setTimeout(() => {
            alertVisible = false;
        }, 3000);
    }
</script>

<figure id="Weather" class="highcharts-figure">
    {#if loading}
    <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
    </div>
    {/if}
    <div id="container"></div>
    <p class="highcharts-description">
        En este gráfico, se muestra la evolución diaria del pico máximo de generación eléctrica eólica
         a nivel nacional, comparándose con la evolución del total de subvenciones diarias registradas en la Comunidad Valenciana,
        desde el 25 de octubre hasta el 25 de diciembre de 2024
    </p>
</figure>



<div class="container fluid">
    {#if alertVisible}
        <div class="alert alert-{alertType} alert-dismissible show mt-3" role="alert">
            {alertMessage}
            <button type="button" class="btn-close" aria-label="Close" on:click={() => alertVisible = false}></button>
        </div>
    {/if}
</div>
