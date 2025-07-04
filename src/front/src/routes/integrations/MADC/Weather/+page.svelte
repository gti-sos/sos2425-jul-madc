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

    const valor= "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Valencia,ES/2024-10-25/2024-12-25?unitGroup=metric&include=days,alerts&key=";
    const API_TOKEN = "8U7L2ZR8NX2M3N55XP7Q7FUAV";
    const token = import.meta.env.VITE_WEATHER_API_KEY;
    let HOSTWeather = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest";
    let APIWeather = HOSTWeather + `/services/timeline/Valencia,ES/2024-10-25/2024-12-25?unitGroup=metric&include=days&key=${API_TOKEN}`;    

    if (dev) API = DEVEL_HOST + API;
    
    //Weather
    let weather =[];
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

            let diasExcl=["01/10/2024", "02/10/2024", "03/10/2024", "04/10/2024", "05/10/2024",
                "06/10/2024", "07/10/2024", "08/10/2024", "09/10/2024", "10/10/2024",
                "11/10/2024", "12/10/2024", "13/10/2024", "14/10/2024", "15/10/2024",
                "16/10/2024", "17/10/2024", "18/10/2024", "19/10/2024", "20/10/2024",
                "21/10/2024", "22/10/2024", "23/10/2024", "24/10/2024", "26/12/2025",
                "27/12/2025", "28/12/2025", "29/12/2025", "30/12/2025", "31/12/2025"];
            aids = Object.fromEntries(Object.entries(aids).filter(([key, value]) => value > 1 && !diasExcl.includes(key)));
            aids = Object.entries(aids).map(([key, value]) => ({ name: key, value: value }));
            aids= aids.sort((a, b) => {
                const [diaA, mesA, anioA] = a.name.split("/");
                const [diaB, mesB, anioB] = b.name.split("/");

                const fechaA = new Date(Number(anioA), Number(mesA) - 1, Number(diaA)); // mes: 0-indexado
                const fechaB = new Date(Number(anioB), Number(mesB) - 1, Number(diaB));

                return fechaA - fechaB;
            });
            //let numeros= Object.values(aids).map(obj=> obj.value);
            //console.log(numeros);
            console.log(aids);
        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function getWeatherData() {
        try {
            let res = await fetch(APIWeather);
            let data = await res.json();
            
            console.log(data);

            const fechasConAids = new Set(aids.map(obj => obj.name));

            data["days"].forEach(obj=>{
                let date= obj.datetime.split("-");
                let fecha= `${date[2]}/${date[1]}/${date[0]}`;
                let object= {name: fecha, value: obj.precip};
                if(fechasConAids.has(object.name)){
                    weather.push(object);
                }
            });
            weather= weather.sort((a, b) => {
                const [diaA, mesA, anioA] = a.name.split("/");
                const [diaB, mesB, anioB] = b.name.split("/");

                const fechaA = new Date(Number(anioA), Number(mesA) - 1, Number(diaA)); // mes: 0-indexado
                const fechaB = new Date(Number(anioB), Number(mesB) - 1, Number(diaB));

                return fechaA - fechaB;
            });
            console.log(weather);

        } catch (error) {
            console.error("Error al cargar datos del clima:", error);
            showAlert("Error al cargar datos meteorológicos", "danger");
        }
    }

    async function renderChart() {
        await tick(); // <- asegura que el DOM esté renderizado antes de dibujar el gráfico
                
        let container= document.getElementById("container");
        container.style="style=width: 100%; height: 550px;";

        let dias= aids.map(obj=> obj.name);

        Highcharts.chart('container', {
            chart: {
                zooming: {
                    type: 'xy'
                }
            },
            title: {
                text: 'Evolución Subvenciones y Precipitación diaria en Valencia',
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
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Subvenciones',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: 'Precipitación',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value} mm',
                    style: {
                        color: Highcharts.getOptions().colors[0]
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
                name: 'Precipitación',
                type: 'column',
                yAxis: 1,
                data: weather.map(obj=> obj.value),
                tooltip: {
                    valueSuffix: ' mm'
                }

            }, {
                name: 'Subvenciones',
                type: 'area',
                data: aids.map(obj=> obj.value),
                tooltip: {
                    valueSuffix: ' subv.'
                }
            }]
        });
    }

    async function processGraphs() {
        loading = true;
        await getAidsData();
        await getWeatherData();
        await renderChart();
        loading = false;
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
        En este gráfico, se muestra la evolución diaria del total acumulado de precipitación pronosticado
        en la estación meteorológica de Valencia,
        comparándose con la evolución del total de subvenciones diarias registradas en Valencia,
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
