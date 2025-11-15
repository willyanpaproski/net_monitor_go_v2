'use client';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import Container from '@mui/material/Container';
import type { ContainerProps } from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const PageContentHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 0),
}));

const PageHeaderBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: 'rgba(255, 255, 255, 0.4)',
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
  [`& .${breadcrumbsClasses.li}`]: {
    color: 'rgba(248, 250, 252, 0.7)',
    fontSize: '0.875rem',
    '&:last-child': {
      color: '#ffffff',
      fontWeight: 600,
    },
  },
}));

const PageHeaderToolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  marginLeft: 'auto',
}));

export interface Breadcrumb {
  label: string;
  path?: string;
}

export interface PageContainerProps extends ContainerProps {
  children?: React.ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function PageContainer(props: PageContainerProps) {
  const { children, title, breadcrumbs = [], actions = null } = props;

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        background: '#000000',
        minHeight: '100vh',
        py: 2,
        px: 3,
      }}
    >
      <Stack sx={{ flex: 1 }} spacing={3}>
        <Stack>
          {breadcrumbs.length > 0 && (
            <PageHeaderBreadcrumbs
              aria-label="breadcrumb"
              separator={<NavigateNextRoundedIcon fontSize="small" />}
            >
              {breadcrumbs.map((breadcrumb, index) => (
                <Typography 
                  key={index} 
                  variant="body2"
                  sx={{ 
                    color: index === breadcrumbs.length - 1 ? '#ffffff' : 'rgba(248, 250, 252, 0.7)',
                    fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                  }}
                >
                  {breadcrumb.label}
                </Typography>
              ))}
            </PageHeaderBreadcrumbs>
          )}
          <PageContentHeader>
            {title && (
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                {title}
              </Typography>
            )}
            <PageHeaderToolbar>{actions}</PageHeaderToolbar>
          </PageContentHeader>
        </Stack>
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#000000',
        }}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
}