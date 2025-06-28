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

</style>

<script>
// @ts-nocheck

    import { onMount, tick} from "svelte";
    import { dev } from "$app/environment";
    
    // @ts-ignore
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats/All";
    if (dev) API = DEVEL_HOST + API;

    // @ts-ignore
    let aids={};

    async function getData() {
        try {
            let res = await fetch(API);
            let json = await res.json();

            for (const obj of json) {
                if (!aids[obj.month]) {
                    aids[obj.month] = {};
                }

                if (aids[obj.month][obj.prov_name]) {
                    aids[obj.month][obj.prov_name] += Math.round(obj.amt_granted);
                } else {
                    aids[obj.month][obj.prov_name] = Math.round(obj.amt_granted);
                }
            }

        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function renderChart() {
        await tick(); // <- asegura que el DOM esté renderizado antes de dibujar el gráfico

        Highcharts.chart('container', {
            chart: { type: 'bar' },
            title: { text: 'Evolución Subvenciones por Provincia' },
            xAxis: {
                categories: ["Octubre", "Noviembre", "Diciembre"],
                title: null,
                gridLineWidth: 1,
                lineWidth: 0
            },
            yAxis: {
                min: 0,
                title: { text: 'Monto total subvencionado (millones €)', align: 'high' },
                labels: { overflow: 'justify' },
                gridLineWidth: 0
            },
            tooltip: { valueSuffix: ' €' },
            plotOptions: {
                bar: {
                    borderRadius: '50%',
                    dataLabels: { enabled: true },
                    groupPadding: 0.1
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
                shadow: true
            },
            credits: { enabled: false },
            series: [
                {
                    name: 'Alicante',
                    data: [getAmt(10, "Alicante"), getAmt(11, "Alicante"), getAmt(12, "Alicante")]
                },
                {
                    name: 'Valencia',
                    data: [getAmt(10, "Valencia"), getAmt(11, "Valencia"), getAmt(12, "Valencia")]
                },
                {
                    name: 'Castellón',
                    data: [getAmt(10, "Castellón"), getAmt(11, "Castellón"), getAmt(12, "Castellón")]
                }
            ]
        });
    }

    async function processGraphs() {
        await getData();
        await renderChart();
    }

    onMount(() => {
        processGraphs();
    });

    function getAmt(month, prov_name) {
        return aids[month]?.[prov_name] ?? 0;
    }

    function showAlert(message, type) {
        alertMessage = message;
        alertType = type;
        alertVisible = true;
        setTimeout(() => alertVisible = false, 3000);
    }
</script>


<figure class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
        En este gráfico, se muestra la evolución mensual (último trimestre del 2024) 
        del total subvencionado a las empresas e instituciones
        de cada provincia de la Comunidad Valenciana afectadas por la DANA.
    </p>
</figure>

{#if alertVisible}
<div class="alert" color={alertType} isOpen={alertVisible} toggle={() => alertVisible = false}>
    {alertMessage}
</div>
{/if}
