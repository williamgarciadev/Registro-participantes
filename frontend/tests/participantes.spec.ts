import { test, expect } from '@playwright/test'

test.describe('Participantes - listado', () => {
  test('muestra tabla y filtros principales', async ({ page }) => {
    await page.goto('/participantes')

    await expect(page.getByRole('heading', { name: 'Participantes' })).toBeVisible()
    await expect(page.getByPlaceholder('Buscar por nombre, apellido o email...')).toBeVisible()
    await expect(page.getByText(/Filtro activo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Recargar listado de participantes' })).toBeVisible()
  })
})
