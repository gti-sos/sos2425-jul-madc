// tests/e2e/dana-grants-subsidies-stats.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/dana-grants-subsidies-stats';

const nuevaSubvencion = {
    "grant_date": "31/12/2024",
    "year": 2024,
    "month": 12,
    "region_name": "Alicante / Alacant",
    "prov_name": "Alicante/Alacant",
    "mun_name": "Denia",
    "grantor": "Consejería de Transformación Económica",
    "benef_id": "B73614928",
    "benef_name": "GREEN AVOCADO TECH S.L.",
    "benef_type": "startup_innovación",
    "aid_type": "Innovación verde",
    "purpose": "Desarrollo de un sistema de IA para optimizar el riego en plantaciones de aguacates",
    "fund_type": "PlanTechVerde",
    "fund_eu": 7000.00,
    "fund_state": 15000.00,
    "fund_regional": 12000.00,
    "fund_local": 8500.00,
    "fund_other": 0.00,
    "amt_granted": 42500.00,
    "amt_paid": 25000.00 
};

const tipoBenefActualizado = "PERSONAS JURÍDICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA";

async function rellenarFormulario(page, datos) {
  for (const [key, value] of Object.entries(datos)) {
    const input = await page.locator(`#${key}`);
    if (await input.count()) {
      await input.fill(value.toString());
    }
  }
}

async function filtrarPorBenefId(page, id) {
  await page.locator('#filtros').click();
  await page.locator('h5:has-text("Beneficiario")').click();
  await page.locator('#filtroBenefId').fill(id);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
}

test.describe('Gestión de subvenciones - CRUD', () => {
  test('Crear subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h2')).toContainText('Ayudas y subvenciones solicitadas');

    await page.getByText('Crear nueva subvención').click();

    await rellenarFormulario(page, nuevaSubvencion);
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.locator('.alert-success')).toContainText('Subvención creada con éxito');
    await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_id })).toBeVisible();
  });

  test('Buscar y verificar subvención creada', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    const filas = page.locator('tbody');
    await expect(filas).toHaveCount(1);
    await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_id })).toBeVisible();
  });

  test('Editar subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    const fila = page.locator(`tr:has-text("${nuevaSubvencion.benef_id}")`);
    await fila.getByRole('button', { name: 'Editar' }).click();

    await expect(page).toHaveURL(new RegExp(`/editar/${nuevaSubvencion.mun_name}/${nuevaSubvencion.month}/${nuevaSubvencion.benef_id}`));
    const inputNombre = page.locator('#edit-benef_type');
    await inputNombre.fill(tipoBenefActualizado);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.locator('.alert-success')).toContainText('Subvención actualizada con éxito');
    await expect(page).toHaveURL(BASE_URL);

    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);
    await expect(page.getByRole('cell', { name: tipoBenefActualizado })).toBeVisible();
  });

  test('Eliminar subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    //await page.locator('#confirmar-eliminacion').waitFor({ state: 'visible' });
    const fila = page.locator(`tr:has-text("${tipoBenefActualizado}")`);
    await fila.getByRole('button', { name: 'Eliminar' }).click();

    await page.locator('.modal-footer button:has-text("Eliminar")').click();


    await expect(page.locator('.alert-success')).toContainText('Subvención eliminada con éxito');
    await page.locator('#filtros').click();

    await expect(page.locator(`tr:has-text("${tipoBenefActualizado}")`)).toHaveCount(0);
  });
});

//----------------------------
// tests/e2e/dana-grants-subsidies-stats.spec.js
//import { test, expect } from '@playwright/test';

//const BASE_URL = 'http://localhost:3000/dana-grants-subsidies-stats';

/*const nuevaSubvencion = {
  year: 2024,
  month: 12,
  grant_date: "31/12/2024",
  benef_id: "B73614928",
  benef_name: "GREEN AVOCADO TECH S.L.",
  benef_type: "PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA",
  purpose: "Desarrollo de un sistema de IA para optimizar el riego en plantaciones de aguacates",
  grantor: "Consejería de Transformación Económica",
  aid_type: "SUBVENCIÓN y ENTREGA DINERARIA SIN CONTRAPRESTACIÓN",
  amt_granted: 42500,
  amt_paid: 25000,
  region_name: "Comunidad Valenciana",
  fund_local: 8500,
  fund_regional: 12000,
  fund_state: 15000,
  fund_eu: 7000,
  fund_other: 0,
  fund_type: "Autonómica/Estatal/Europea",
  prov_name: "Alicante",
  mun_name: "Denia"
};
*/
//const nombreActualizado = "AGUACATE MARRON TECH S.L.";

/*async function rellenarFormulario(page, datos) {
  for (const [key, value] of Object.entries(datos)) {
    const input = await page.locator(`#${key}`);
    if (await input.count()) {
      await input.fill(value.toString());
    }
  }
}

async function filtrarPorBenefId(page, id) {
  // Hacer clic en el botón de filtros con el icono de embudo
  await page.locator('button:has-text("Filtros")').click();
  
  // Esperar a que el formulario de filtros sea visible y expandir la sección Beneficiario
  await page.locator('text=Beneficiario').click();
  
  // Rellenar el filtro de ID de beneficiario
  await page.locator('#filtroBenefId').fill(id);
  
  // Aplicar filtros
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
}

test.describe('Gestión de subvenciones - CRUD', () => {
  test('Crear subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h2')).toContainText('Ayudas y subvenciones solicitadas');

    // Hacer clic en el botón "Crear nueva subvención"
    await page.locator('button:has-text("Crear nueva subvención")').click();

    await rellenarFormulario(page, nuevaSubvencion);
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.locator('.alert')).toContainText('Subvención creada con éxito');
    await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_name })).toBeVisible();
  });

  test('Buscar y verificar subvención creada', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    const filas = page.locator('tbody tr');
    await expect(filas).toHaveCount(1);
    await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_id })).toBeVisible();
  });

  test('Editar subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    // Hacer clic en el botón de editar en la fila que contiene el nombre del beneficiario
    const fila = page.locator(`tr:has-text("${nuevaSubvencion.benef_name}")`);
    await fila.locator('button:has-text("Editar")').click();

    await expect(page).toHaveURL(new RegExp(`/editar/${nuevaSubvencion.mun_name}/${nuevaSubvencion.month}/${nuevaSubvencion.benef_id}`));
    const inputNombre = page.locator('#edit-benef_name');
    await inputNombre.fill(nombreActualizado);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.locator('.alert')).toContainText('Subvención actualizada con éxito');
    await expect(page).toHaveURL(BASE_URL);

    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);
    await expect(page.getByRole('cell', { name: nombreActualizado })).toBeVisible();
  });

  test('Eliminar subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    // Hacer clic en el botón de eliminar en la fila
    const fila = page.locator(`tr:has-text("${nombreActualizado}")`);
    await fila.locator('button:has-text("Eliminar")').click();

    // Esperar a que aparezca el modal y hacer clic en el botón de confirmación de eliminación
    await page.locator('#confirmar-eliminacion').click();

    await expect(page.locator('.alert')).toContainText('Subvención eliminada con éxito');
    
    // Limpiar filtros y verificar que el registro ha sido eliminado
    await page.locator('button:has-text("Filtros")').click();
    await page.locator('button:has-text("Limpiar filtros")').click();

    await expect(page.locator(`tr:has-text("${nombreActualizado}")`)).toHaveCount(0);
  });
});*/