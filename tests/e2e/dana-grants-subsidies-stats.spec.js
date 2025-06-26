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

const tipoBenefActualizado = "PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA";

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
  await page.locator('#flecha-beneficiario').click();
  await page.locator('#filtroBenefId').fill(id);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
}

test.describe('Gestión de subvenciones - CRUD', () => {
  test('Crear subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h2:has-text("Ayudas y subvenciones solicitadas")')).toBeVisible();

    await page.getByText('Crear nueva subvención').click();
    
    await expect(page.locator('h4:has-text("Nueva subvención")')).toBeVisible();

    await rellenarFormulario(page, nuevaSubvencion);
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.locator('div.alert:has-text("Subvención creada con éxito")')).toBeVisible();
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

    await expect(page.locator('div.alert:has-text("Subvención actualizada con éxito")')).toBeVisible();
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

    await page.locator('.modal-footer button#confirmar-eliminacion').click();


    await expect(page.locator('.alert-success')).toContainText('Subvención eliminada con éxito');
    await page.locator('#filtros').click();

    await expect(page.locator(`tr:has-text("${tipoBenefActualizado}")`)).toHaveCount(0);
  });
});