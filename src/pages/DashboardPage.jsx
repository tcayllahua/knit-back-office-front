import { useState } from 'react'
import { Card, CardContent, CardMedia, CardActionArea, Typography, Box, Skeleton, IconButton } from '@mui/material'
import {
  ImageNotSupported as ImageNotSupportedIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useGetRecentHqpdsConfigurations } from '../hooks/queries'

const VISIBLE = 4
const GAP = 16

export const DashboardPage = () => {
  const { data: recentConfigs, isLoading: isLoadingRecent } = useGetRecentHqpdsConfigurations()
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)

  const items = recentConfigs || []
  const maxOffset = Math.max(0, items.length - VISIBLE)
  const canPrev = offset > 0
  const canNext = offset < maxOffset

  const cardWidth = `calc((100% - ${(VISIBLE - 1) * GAP}px) / ${VISIBLE})`
  const shift = `calc(-${offset} * (100% - ${(VISIBLE - 1) * GAP}px) / ${VISIBLE} - ${offset * GAP}px)`

  return (
    <Box>
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Sugeridos para ti
        </Typography>
        <Box sx={{ position: 'relative' }}>
          {/* Left arrow */}
          {canPrev && (
            <IconButton
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              sx={{
                position: 'absolute',
                left: -18,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'background.paper',
                boxShadow: 3,
                width: 36,
                height: 36,
                '&:hover': { bgcolor: 'background.paper', boxShadow: 6 },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
          {/* Right arrow */}
          {canNext && (
            <IconButton
              onClick={() => setOffset((o) => Math.min(maxOffset, o + 1))}
              sx={{
                position: 'absolute',
                right: -18,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'background.paper',
                boxShadow: 3,
                width: 36,
                height: 36,
                '&:hover': { bgcolor: 'background.paper', boxShadow: 6 },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}

          <Box sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                gap: `${GAP}px`,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              style={{ transform: `translateX(${shift})` }}
            >
              {isLoadingRecent
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Card
                      key={i}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        minWidth: cardWidth,
                        maxWidth: cardWidth,
                        flexShrink: 0,
                      }}
                    >
                      <Skeleton variant="rectangular" height={140} />
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Skeleton width="70%" height={20} />
                        <Skeleton width="50%" height={16} sx={{ mt: 0.5 }} />
                      </CardContent>
                    </Card>
                  ))
                : items.map((config) => {
                    const images = Array.isArray(config.image_file_design) ? config.image_file_design : []
                    const thumbUrl = images[0]?.simulation_image_url
                    return (
                      <Card
                        key={config.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          minWidth: cardWidth,
                          maxWidth: cardWidth,
                          flexShrink: 0,
                          transition: 'box-shadow 0.2s, transform 0.2s',
                          '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                        }}
                      >
                        <CardActionArea onClick={() => navigate(`/configuraciones/editar/${config.id}`)}>
                          {thumbUrl ? (
                            <CardMedia
                              component="img"
                              height="140"
                              image={thumbUrl}
                              alt={config.design_name}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 140,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'action.hover',
                              }}
                            >
                              <ImageNotSupportedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                            </Box>
                          )}
                          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {config.design_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {config.garment_type || 'Sin tipo'}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    )
                  })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
