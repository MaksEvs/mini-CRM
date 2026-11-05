import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { supabase } from '../../shared/api/supabase'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { session, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (session && profile) {
    return <Navigate to={profile.role === 'manager' ? '/objects' : '/my-tasks'} replace />
  }
  if (loading) {
    return null
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!supabase || busy) {
      return
    }
    setBusy(true)
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (loginError) {
      setError('Не удалось войти. Проверьте адрес почты и пароль.')
    }
    setBusy(false)
  }

  return (
    <Box className={styles.page}>
      <Box className={styles.art}>
        <Box className={styles.brand}>
          <span className={styles.brandMark}>К</span>
          <span>
            контур<span className={styles.brandDot}>.</span>
          </span>
        </Box>
        <Box className={styles.illustration}>
          <Box className={styles.sun} />
          <Box className={`${styles.building} ${styles.buildingOne}`} />
          <Box className={`${styles.building} ${styles.buildingTwo}`} />
          <Box className={`${styles.building} ${styles.buildingThree}`} />
          <Box className={`${styles.crane} ${styles.craneOne}`} />
          <Box className={`${styles.crane} ${styles.craneTwo}`} />
          <Box className={styles.groundLine} />
        </Box>
        <Box className={styles.tagline}>
          <Typography variant="overline">СТРОИТЕЛЬСТВО · КОНТРОЛЬ · РЕЗУЛЬТАТ</Typography>
          <Typography variant="h3">
            Каждая задача
            <br />
            на своём месте.
          </Typography>
          <Typography>Рабочая среда для команды и объектов.</Typography>
        </Box>
      </Box>
      <Box className={styles.formSide}>
        <Box className={styles.formWrap}>
          <Typography variant="overline" color="primary">
            РАДЫ ВАС ВИДЕТЬ
          </Typography>
          <Typography variant="h4" mt={1}>
            Войти в систему
          </Typography>
          <Typography color="text.secondary" mt={1} mb={4}>
            Введите данные рабочей учётной записи
          </Typography>
          <Box
            component="form"
            onSubmit={(event: FormEvent<HTMLFormElement>) => void submit(event)}
          >
            <Stack gap={2.5}>
              <TextField
                label="Рабочая почта"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Пароль"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" size="large" disabled={busy}>
                {busy ? <CircularProgress size={22} /> : 'Войти в Контур'}
              </Button>
            </Stack>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            Нет доступа? Попросите администратора создать учётную запись.
          </Typography>
        </Box>
        <Typography className={styles.copyright}>КОНТУР · УПРАВЛЕНИЕ ПРОЕКТАМИ</Typography>
      </Box>
    </Box>
  )
}
