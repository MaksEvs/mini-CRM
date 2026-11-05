import {
  AppBar,
  Box,
  Button,
  Container,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Profile } from '../../shared/api/database.types'
import styles from './WorkspaceLayout.module.css'

interface WorkspaceLayoutProps {
  profile: Profile
  onLogout: () => void
  title: string
  children: ReactNode
}

export function WorkspaceLayout({ profile, onLogout, title, children }: WorkspaceLayoutProps) {
  const location = useLocation()
  const manager = profile.role === 'manager'
  const rootPath = manager ? '/objects' : '/my-tasks'

  return (
    <Box className={styles.appFrame}>
      <AppBar position="sticky" elevation={0} className={styles.topbar}>
        <Toolbar className={styles.topbarInner}>
          <Link to={rootPath} className={styles.brand}>
            <span className={styles.brandMark}>К</span>
            <span>
              контур<span className={styles.brandDot}>.</span>
              <small>ОБЪЕКТЫ И ЗАДАЧИ</small>
            </span>
          </Link>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box className={styles.userAvatar}>{profile.full_name.slice(0, 1).toUpperCase()}</Box>

            <Box className={styles.userDetails}>
              <Typography variant="body2" fontWeight={600}>
                {profile.full_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {manager ? 'Постановщик' : 'Исполнитель'}
              </Typography>
            </Box>

            <Button onClick={onLogout} color="inherit" className={styles.logoutButton}>
              Выйти
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className={styles.mainLayout}>
        <Box component="aside" className={styles.sidebar}>
          <Typography className={styles.navHeading}>РАБОЧИЙ СТОЛ</Typography>

          <List disablePadding>
            <ListItemButton
              component={Link}
              to={rootPath}
              selected={location.pathname === rootPath}
              className={styles.navItem}
            >
              <span className={styles.navIcon}>{manager ? '▦' : '✓'}</span>
              <ListItemText primary={manager ? 'Объекты' : 'Мои задачи'} />
            </ListItemButton>

            {!manager && (
              <ListItemButton
                component={Link}
                to="/objects"
                selected={location.pathname === '/objects'}
                className={styles.navItem}
              >
                <span className={styles.navIcon}>▦</span>
                <ListItemText primary="Доступные объекты" />
              </ListItemButton>
            )}
          </List>

          <Box className={styles.sidebarFooter}>
            <span className={styles.liveDot} />
            Данные защищены политиками Supabase
          </Box>
        </Box>

        <Box component="main" className={styles.pageContent}>
          <Typography className={styles.breadcrumb}>
            РАБОЧАЯ ОБЛАСТЬ <span>/</span> {title.toUpperCase()}
          </Typography>
          {children}
        </Box>
      </Container>
    </Box>
  )
}
