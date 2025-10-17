import { expect, test } from '@playwright/test'

test.describe('Marketing homepage experience', () => {
  test('allows visitors to explore product solutions and contact options', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: '打造一体化的 XControl 控制平面' })).toBeVisible()
    await expect(page.getByText('跨集群与多云环境的一体化策略治理')).toBeVisible()

    await expect(page.getByRole('heading', { level: 2, name: 'XCloudFlow' })).toBeVisible()
    const primaryCta = page.getByRole('link', { name: '立刻体验' }).first()
    await expect(primaryCta).toHaveAttribute('href', /\/demo\/?\?product=xcloudflow/)
    await expect(page.getByRole('link', { name: '下载链接' })).toHaveAttribute(
      'href',
      /\/download\/?\?product=xcloudflow/
    )
    await expect(page.getByRole('link', { name: '文档链接' })).toHaveAttribute('href', /\/docs\/xcloudflow/)

    await page.getByRole('button', { name: /XScopeHub/ }).first().click()
    await expect(page.getByRole('heading', { level: 2, name: 'XScopeHub' })).toBeVisible()
    await expect(page.getByText('智能告警关联与根因分析')).toBeVisible()
    await expect(primaryCta).toHaveAttribute('href', /\/demo\/?\?product=xscopehub/)

    await expect(page.getByRole('button', { name: '折叠保持联系面板' })).toBeVisible()
    const newsletterLink = page.getByRole('link', { name: '立即订阅' }).first()
    await expect(newsletterLink).toBeVisible()
    await expect(newsletterLink).toHaveAttribute('href', /newsletter/)
  })
})
