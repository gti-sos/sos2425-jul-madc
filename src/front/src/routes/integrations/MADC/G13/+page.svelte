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

    let HOSTG13 = "https://sos2425-13.onrender.com";
    let APIG13 = HOSTG13 + "/api/v2/national-parks";

    //G13
    let national_parks0={};
    let national_parks={};
    let aids={};

    async function getNationalParksData() {
        try {
            let pre0= await fetch(APIG13);
            if(pre0.status===404){
                await fetch(APIG13+"/loadInitialData");
            }
            let res= await fetch(APIG13);
            let json= await res.json();

            json.forEach(obj =>{
                if (!national_parks0[obj.autonomous_community]) {
                    national_parks0[obj.autonomous_community] =  obj.initial_area;
                } else {
                    national_parks0[obj.autonomous_community] = national_parks0[obj.autonomous_community] + obj.initial_area;
                }
            });

            json.forEach(obj =>{
                if (!national_parks[obj.autonomous_community]) {
                    national_parks[obj.autonomous_community] =  obj.current_area;
                } else {
                    national_parks[obj.autonomous_community] = national_parks[obj.autonomous_community] + obj.current_area;
                }
            });
            
        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function renderChart() {
        await tick(); // <- asegura que el DOM esté renderizado antes de dibujar el gráfico
        
        let nationalParksAACC= Object.keys(national_parks);
        console.log(nationalParksAACC);
        
        let container= document.getElementById("container");
        container.style.width = '100%';
        container.style.height = '550px';

        if (echarts.getInstanceByDom(container)) {
            echarts.dispose(container);
        }
        const myChart = echarts.init(container);

        const option = {
            title: {
                text: 'Area de Parques Nacionales por CCAA inicial vs actual',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                type: 'shadow'
                }
            },
            legend: {
                orient: 'horizontal',
                bottom: "2.5%",
                right: "0",
                textStyle: {
                    fontSize: 12
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '0%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01]
            },
            yAxis: {
                type: 'category',
                data: nationalParksAACC
            },
            series: [
                {
                name: 'Superficie Inicial (ha)',
                type: 'bar',
                data: Object.values(national_parks0)
                },
                {
                name: 'Superficie Actual (ha)',
                type: 'bar',
                data: Object.values(national_parks)
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
        await getNationalParksData();
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

<figure id="G13" class="echarts-figure">
    <div id="container"></div>
    <p class="echarts-description">
        En este gráfico, se muestra el área total
        (en hectáreas) de los parques nacionales por comunidad autónoma
        en el momento inicial de regitro del parque nacional,
        comparándose con el total en el momento actual.
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
