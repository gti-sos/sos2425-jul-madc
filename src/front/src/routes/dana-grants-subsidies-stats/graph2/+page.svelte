<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
</svelte:head>

<!-- svelte-ignore css_unused_selector -->
<style>
    .echarts-figure,
    .echarts-data-table table {
        min-width: 310px;
        max-width: 800px;
        margin: 1em auto;
    }

    #container {
        height: 500px;
    }

    .echarts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #ebebeb;
        margin: 10px auto;
        text-align: center;
        width: 100%;
        max-width: 500px;
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
    }

</style>

<script>
// @ts-nocheck

    import { onMount, tick } from "svelte";
    import { dev } from "$app/environment";
    import * as echarts from 'echarts';
    
    // @ts-ignore
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats/All";
    if (dev) API = DEVEL_HOST + API;

    let aids={};
    // @ts-ignore

    async function getData() {
		try {
			const res = await fetch(API);
			const json = await res.json();

			let grouped = {};
			json.forEach(obj => {
					grouped[obj.benef_type] = (grouped[obj.benef_type] || 0) + 1;
				});

			// Filtrar beneficiarios con más de 1 ayuda
			grouped = Object.fromEntries(Object.entries(grouped).filter(([_, value]) => value > 1));

			// Transformar a formato compatible con ECharts
			aids= Object.entries(grouped).map(([name, value]) => ({ name, value }));
		} catch (err) {
			showAlert("Error al obtener los datos", "danger");
			console.error("Error en getData:", err);
			aids={};
		}
	}

    async function renderChart(data) {
		await tick(); // Esperar a que el DOM esté listo
        let container= document.getElementById("container");

		if (!container) {
			console.error("Contenedor del gráfico no encontrado");
			return;
		}

		const myChart = echarts.init(container);

		const option = {
			title: {
				text: 'Distribución de Subvenciones por Tipo de Beneficiario',
				left: 'center'
			},
			tooltip: {
				trigger: 'item',
				formatter: '{b}<br/><strong>{d}%</strong> ({c} ayudas)'
			},
			legend: {
				top: '10%',
				left: 'center'
			},
			series: [
				{
					name: 'Distribución',
					type: 'pie',
					radius: ['35%', '70%'],
					center: ['50%', '70%'],
					startAngle: 180,
					endAngle: 360,
					labelLine: { show: true },
					label: {
						show: true,
						formatter: '{b}: {c}'
					},
					data: data,
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			]
		};

		myChart.setOption(option);

		// Ajuste al cambiar tamaño de pantalla
		window.addEventListener('resize', () => {
			myChart.resize();
		});
	}

    async function processGraphs() {
		await getData();
		if (aids.length > 0) {
			await renderChart(aids);
		}
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

<figure class="echarts-figure">
    <div id="container"></div>
    <p class="echarts-description">
        En este gráfico, se muestra, en función del tipo de beneficiario,
        la distribución del total de ayudas y subvenciones
        concedidas (durante el último trimestre del 2024) a las empresas e instituciones
        de la Comunidad Valenciana afectadas por la DANA.
    </p>
</figure>

{#if alertVisible}
<div class="alert" color={alertType} isOpen={alertVisible} toggle={() => alertVisible = false}>
    {alertMessage}
</div>
{/if}
