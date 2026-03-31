import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import {
  Engineering as EngineeringIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  BuildCircle as BuildCircleIcon,
} from '@mui/icons-material'
import { useGetMachineStats } from '../hooks/queries'

export const DashboardPage = () => {
  const { data: stats, isLoading } = useGetMachineStats()

  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: `${color}20`,
              borderRadius: 2,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5">{isLoading ? '...' : value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Resumen de Parámetros de Máquina
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EngineeringIcon sx={{ fontSize: 40, color: '#1976d2' }} />}
            title="Total de Registros"
            value={stats?.total || 0}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />}
            title="Máquinas Operativas"
            value={stats?.operativas || 0}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<BuildCircleIcon sx={{ fontSize: 40, color: '#ff9800' }} />}
            title="En Mantenimiento"
            value={stats?.mantenimiento || 0}
            color="#ff9800"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ErrorIcon sx={{ fontSize: 40, color: '#f44336' }} />}
            title="Máquinas Primarias"
            value={stats?.primarias || 0}
            color="#f44336"
          />
        </Grid>
      </Grid>
    </Box>
  )
}
