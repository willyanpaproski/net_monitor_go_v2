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
  gap: theme.spacing(2),
}));

const PageHeaderBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

const PageHeaderToolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  marginLeft: 'auto',
}));

export interface Breadcrumb {
  path?: string;
}
export interface PageContainerProps extends ContainerProps {
  children?: React.ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function PageContainer(props: PageContainerProps) {
  const { children, title, actions = null } = props;

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ flex: 1, my: 2 }} spacing={2}>
        <Stack>
          <PageHeaderBreadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextRoundedIcon fontSize="small" />}
          >
          </PageHeaderBreadcrumbs>
          <PageContentHeader>
            {title ? <Typography variant="h4">{title}</Typography> : null}
            <PageHeaderToolbar>{actions}</PageHeaderToolbar>
          </PageContentHeader>
        </Stack>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
}
