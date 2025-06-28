<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
</svelte:head>
<!-- svelte-ignore css_unused_selector -->
<style>
    .echarts-figure {
        min-width: 310px;
        max-width: 800px;
        margin: 2em auto;
        text-align: center;
    }

    .echarts-figure #container{ 
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .echarts-figure .echarts{
        margin: 0 auto;
    }

    .echarts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #ebebeb;
        margin: 10px auto;
        text-align: center;
        width: 100%;
    }

    .echarts-data-table caption {
        padding: 1em 0;
        font-size: 1.2em;
        color: #555;
    }

    .echarts-data-table th {
        font-weight: 600;
        padding: 0.5em;
        margin-bottom: 4em;
    }

    .echarts-data-table td,
    .echarts-data-table th,
    .echarts-data-table caption {
        padding: 0.5em;
    }

    .echarts-data-table thead tr,
    .echarts-data-table tbody tr:nth-child(even) {
        background: #f8f8f8;
    }

    .echarts-data-table tr:hover {
        background: #f1f7ff;
    }

    .echarts-description {
        margin: 0 10px;
        text-align: center;
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

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats/All";
    let HOSTG20 = "https://sos2425-20.onrender.com";
    let APIG20 = HOSTG20 + "/api/v2/fines";

    if (dev) API = DEVEL_HOST + API;
    
    //G20
    let fines={};
    let aids={};

    let aidsPurposesAndfinesTypes = [];

    async function getAidsData() {
        try {
            let res = await fetch(API);
            let json = await res.json();

            json.forEach(obj => {
                if (!aids[obj.purpose]) {
                    aids[obj.purpose] = 1;
                } else {
                    aids[obj.purpose] = aids[obj.purpose] + 1;
                }
            });

            aids = Object.fromEntries(Object.entries(aids).filter(([key, value]) => value > 1));
            aids = Object.entries(aids).map(([key, value]) => ({ name: key, value: value }));
            aids= aids.filter(obj=> {
                let purposes= ["Acceso a la vivienda y fomento de la edificación", "Agricultura, Pesca y Alimentación",
                "Comercio, Turismo y Pymes", "Cooperación internacional para el desarrollo y cultural",
                "Cultura", "Defensa", "Desempleo", "Educación", "Fomento del Empleo", "Industria y Energía",
                "Infraestructuras", "Investigación desarrollo e innovación", "Justicia",
                "Otras actuaciones de carácter económico", "Otras Prestaciones económicas",
                "Sanidad", "Servicios Sociales y Promoción Social", "Subvenciones al transporte"];

                return purposes.includes(obj.name);
            })
            
        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function getFinesData() {
        try {
            let res = await fetch(APIG20);
            let json = await res.json();

            fines= json.filter(fin => fin.city === "Valencia" && fin.year=== 2023).flatMap(fin => {
                return Object.entries(fin)
                        .filter(([k]) => k !== "city" && k !== "year")
                        .map(([k, v]) => {
                            if(k==="fixed_radar"){
                                k="Radar";
                            }else if(k==="itv"){
                                k="ITV";
                            }else if(k==="alcohol_rate"){
                                k="Alcoholemia";
                            }
                            return { name: k, value: v };
                        });
            });
            
        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function renderChart() {
        await tick(); // <- asegura que el DOM esté renderizado antes de dibujar el gráfico
        
        aidsPurposesAndfinesTypes= ([...aids, ...fines]).map(item => item.name);
        
        let container= document.getElementById("container");
        container.style="style=width: 100%; height: 550px;";

        if (echarts.getInstanceByDom(container)) {
            echarts.dispose(container);
        }
        const myChart = echarts.init(container);

        //console.log(container);
        //console.log(myChart);

        const option = {
            title: {
                text: 'Distribución de Subvenciones en Valencia por Propósito\ncon\n Distribución de Multas en Valencia por Tipo (G20)',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {d}% ({c})'
            },
            legend: {
                data: aidsPurposesAndfinesTypes,
                orient: 'horizontal',
                bottom: '0%',
                left: 'center',
                type: 'scroll',
                itemsPerPage: 10,
                pageButtonItemGap: 5,
                pageButtonGap: 5,
                pageButtonPosition: 'end'  
            },
            series: [
                {
                    name: ' Distribución de Multas en Valencia por Tipo',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],
                    label: {
                        position: 'inner',
                        fontSize: 14
                    },
                    labelLine: {
                        show: false
                    },
                    data: fines
                },
                {
                    name: 'Subvenciones por Propósito',
                    type: 'pie',
                    radius: ['45%', '60%'],
                    labelLine: {
                        length: 30
                    },
                    label: {
                        formatter: '{b|{b}：}{d}% ({c})',
                        backgroundColor: '#F6F8FC',
                        borderColor: '#8C8D8E',
                        borderWidth: 1,
                        borderRadius: 4,
                        rich: {
                            a: {
                                color: '#6E7079',
                                lineHeight: 22,
                                align: 'center'
                            },
                            hr: {
                                borderColor: '#8C8D8E',
                                width: '100%',
                                borderWidth: 1,
                                height: 0
                            },
                            b: {
                                color: '#4C5058',
                                fontWeight: 'bold',
                                lineHeight: 33
                            },
                            per: {
                                color: '#fff',
                                backgroundColor: '#4C5058',
                                padding: [3, 4],
                                borderRadius: 4
                            },
                            d: {
                                fontWeight: 'bold'
                            }
                        }
                    },
                    data: aids
                }
            ]
        };

        option && myChart.setOption(option);
        
        // Manejar el redimensionamiento
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    }

    async function processGraphs() {
        await getAidsData();
        await getFinesData();
        await renderChart();
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

<figure id="G20" class="echarts-figure">
    <div id="container"></div>
    <p class="echarts-description">
        En este gráfico, se muestra la distribución del total de ayudas y subvenciones
        concedidas (durante el último trimestre del 2024) a las empresas e instituciones
        de la provincia de Valencia afectadas por la DANA, según el propósito,
        comparándose con la distribución del total de multas registradas en Valencia durante el 2023, según el caracter de multa.
    </p>
</figure>

<div class="container fluid">
    {#if alertVisible}
        <div class="alert alert-{alertType} alert-dismissible show mt-3" role="alert" transition:fade>
            {alertMessage}
            <button type="button" class="btn-close" aria-label="Close" on:click={() => alertVisible = false}></button>
        </div>
    {/if}
</div>
