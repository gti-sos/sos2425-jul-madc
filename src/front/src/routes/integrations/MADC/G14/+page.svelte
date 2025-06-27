<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
</svelte:head>
<!-- svelte-ignore css_unused_selector -->
<style>
    .apexcharts-figure {
        min-width: 310px;
        max-width: 800px;
        margin: 2em auto;
        text-align: center;
    }

    .apexcharts-figure #container{ 
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .apexcharts-figure .apexcharts-canvas {
        margin: 0 auto;
    }

    .apexcharts-description{
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

    import { onMount, tick } from "svelte";
    import { dev } from "$app/environment";
    //import ApexCharts from 'svelte-axpecharts';

    // @ts-ignore
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats/All";
    let HOSTG14 = "https://sos2425-14.onrender.com";
    let APIG14 = HOSTG14 + "/api/v1/employment-data";

    if (dev) API = DEVEL_HOST + API;

    //G14
    let employment_data={};
    let aids={};

    // @ts-ignore

    // Función principal que carga y muestra el gráfico

    async function getAidsData() {
        try {
            let res = await fetch(API);
            let json = await res.json();

            json.filter(obj => obj.purpose === "Acceso a la vivienda y fomento de la edificación") //Fomento del Empleo
            .forEach(obj => {
                if (!aids[obj.month]) {
                    aids[obj.month] = 1;
                } else {
                    aids[obj.month] = aids[obj.month] + 1;
                }
            });

            aids = Object.entries(aids).sort((key, value) => key).map(([key, value]) => {
                let obj = {};
                obj[key] = value;
                return obj;
            });
            //console.log(aids);
            
        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function getEmploymentData() {
         try {
            let res = await fetch(APIG14);
            let json = await res.json();

            let objData= json.filter(obj => obj.autonomous_community === "Comunitat Valenciana");
            let objeto={};

            objData.forEach(obj => {
                const year = obj.year;

                if (!objeto[year]) {
                    objeto[year] = {
                        employment_rate: obj.employment_rate,
                        unemployment_rate: obj.unemployment_rate,
                        cont: 1
                    };
                } else {
                    objeto[year].employment_rate += obj.employment_rate;
                    objeto[year].unemployment_rate += obj.unemployment_rate;
                    objeto[year].cont= objeto[year].cont + 1;
                }
            });

            objeto= Object.entries(objeto).map(([k, v])=> {
                let employment_rate= v.employment_rate/v.cont;
                let unemployment_rate= v.unemployment_rate/v.cont;

                v.employment_rate= employment_rate;
                v.unemployment_rate= unemployment_rate;
                delete v.cont;
                return [k, v];
            }).map(([k,v])=> {
                let obj={};
                obj[k]= v;
                return obj;
            });
            employment_data= objeto;
            console.log(employment_data);

        } catch (err) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    async function renderChart() {
        await tick(); // <- asegura que el DOM esté renderizado antes de dibujar el gráfico
        
        const pobComValenc2024 = (1991259 + 2710808 + 615188);
        const years = Object.keys(employment_data);
        const subvRates = Object.values(aids).map(value => (Object.values(value)/pobComValenc2024)*10000000);

        const employmentRates = employment_data.map(item => {
            const data = Object.values(item)[0];
            return data.employment_rate;
        });

        const unemploymentRates = employment_data.map(item => {
            const data = Object.values(item)[0];
            return data.unemployment_rate;
        });

        let container= document.getElementById("container");
        
        const options = {
            series: [
                {
                    name: 'Tasa de Subvenciones de Fomento del Empleo (por cada 10 mill habitantes)',
                    type: 'column',
                    data: subvRates
                }, 
                {
                    name: 'Tasa de Desempleo',
                    type: 'area',
                    data: unemploymentRates
                },
            ],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
            },
            stroke: {
                width: [0, 2, 5],
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            fill: {
                opacity: [0.85, 0.25, 1],
                gradient: {
                    inverseColors: false,
                    shade: 'light',
                    type: "vertical",
                    opacityFrom: 0.85,
                    opacityTo: 0.55,
                    stops: [0, 100, 100, 100]
                }
            },
            labels: years,
            markers: {
                size: 0
            },
            xaxis: {
                type: 'category'
            },
            annotations: {
                xaxis: [
                    {
                        x: years[years.length - 3],
                        borderColor: '#FF4560',
                        backgroundColor: '#68c1ff',
                        label: {
                            style: {
                                color: '#000'
                            },
                            text: 'Oct.2024'
                        }
                    },
                    {
                        x: years[years.length - 2],
                        borderColor: '#FF4560',
                        backgroundColor: '#68c1ff',
                        label: {
                            style: {
                                color: '#000'
                            },
                            text: 'Nov.2024'
                        }
                    },
                    {
                        x: years[years.length - 1],
                        borderColor: '#FF4560',
                        backgroundColor: '#68c1ff',
                        label: {
                            style: {
                                color: '#000',
                                backgroundColor: '#68c1ff'
                            },
                            text: 'Dic.2024'
                        }
                    }
                ]
            },
            yaxis: {
                title: {
                    text: 'Valor',
                }
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (y) {
                        if (typeof y !== "undefined") {
                            return y.toFixed(2);
                        }
                        return y;
                    }
                }
            },
            title: {
                text: 'Evolución Subvenciones de Fomento de Empleo Comunidad Valenciana\ncon\nEvolución de Tasas de Desempleo (G14)',
                align: 'center'
            }
        };

        const chart = new ApexCharts(container, options);
        chart.render();
        
        // Manejar el redimensionamiento
        window.addEventListener('resize', function() {
            chart.render();
        });
    }

    async function waitForApexCharts() {
        return new Promise((resolve, reject) => {
            const check = () => {
                if (window.ApexCharts) resolve();
                else setTimeout(check, 100); // vuelve a intentar cada 100ms
            };
            check();
    });
}

    async function processGraphs() {
        await getAidsData();
        await getEmploymentData();
        await waitForApexCharts();
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

<figure id="G14" class="apexcharts-figure">
    <div id="container"></div>
    <p class="apexcharts-description">
        En este gráfico, se muestra la evolución mensual (último trimestre del 2024)
        de las tasas de ayudas y subvenciones concedidas a las empresas e instituciones
        de la Comunidad Valenciana afectadas por la DANA (por cada millón de habitantes),
        comparándose con la evolución anual de la tasa de desempleo de la Comunidad Valenciana.
    </p>
</figure>

<div class="container fluid">
    {#if alertVisible}
        <div class="alert alert-{alertType} alert-dismissible fade show mt-3" role="alert" transition:fade>
            {alertMessage}
            <button type="button" class="btn-close" aria-label="Close" on:click={() => alertVisible = false}></button>
        </div>
    {/if}
</div>
