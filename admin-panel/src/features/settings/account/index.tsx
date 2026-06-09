import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Conta'
      desc='Atualize as configurações da sua conta, idioma preferido e fuso horário.'
    >
      <AccountForm />
    </ContentSection>
  )
}
