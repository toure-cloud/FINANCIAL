import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const CustomCard = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  action, 
  loading = false,
  sx = {} 
}) => {
  return (
    <Card sx={{ ...sx, position: 'relative', overflow: 'hidden' }}>
      <CardContent>
        {(title || subtitle || icon || action) && (
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              {icon && (
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </Box>
              )}
              <Box>
                {title && (
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            {action && <Box>{action}</Box>}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default CustomCard;
