import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Perfil'
      desc='Como as outras pessoas verão você no sistema.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
