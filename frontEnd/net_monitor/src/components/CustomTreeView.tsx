import * as React from 'react';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeItem } from '@mui/x-tree-view/useTreeItem';
import {
  TreeItemContent,
  TreeItemIconContainer,
  TreeItemLabel,
  TreeItemRoot,
} from '@mui/x-tree-view/TreeItem';
import { TreeItemIcon } from '@mui/x-tree-view/TreeItemIcon';
import { TreeItemProvider } from '@mui/x-tree-view/TreeItemProvider';

interface TreeItemData {
  id: string;
  label: string;
  color?: 'blue' | 'green' | string;
  children?: TreeItemData[];
  onClick?: any;
}

interface DotIconProps {
  color: string;
}

interface CustomLabelProps {
  color?: 'blue' | 'green' | string;
  expandable?: boolean;
  children: React.ReactNode;
  [key: string]: any;
}

interface CustomTreeItemProps {
  id?: string;
  itemId: string;
  label?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

interface TransitionComponentProps {
  in?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

interface CustomizedTreeViewProps {
  items: TreeItemData[];
  title?: string;
  defaultExpandedItems?: string[];
  defaultSelectedItems?: string[];
  multiSelect?: boolean;
  onItemClick?: (item: TreeItemData, event: React.MouseEvent) => void;
}

function DotIcon({ color }: DotIconProps) {
  return (
    <Box sx={{ marginRight: 1, display: 'flex', alignItems: 'center' }}>
      <svg width={6} height={6}>
        <circle cx={3} cy={3} r={3} fill={color} />
      </svg>
    </Box>
  );
}

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props: TransitionComponentProps) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}

function CustomLabel({ color, expandable, children, ...other }: CustomLabelProps) {
  const theme = useTheme();
  const colors = {
    blue: theme.palette.primary.main,
    green: theme.palette.success.main,
  };

  const iconColor = color ? (colors[color as keyof typeof colors] || color) : undefined;

  return (
    <TreeItemLabel {...other} sx={{ display: 'flex', alignItems: 'center' }}>
      {iconColor && <DotIcon color={iconColor} />}
      <Typography
        className="labelText"
        variant="body2"
        sx={{ color: 'text.primary' }}
      >
        {children}
      </Typography>
    </TreeItemLabel>
  );
}

const CustomTreeItem = React.forwardRef<HTMLLIElement, CustomTreeItemProps>(
  function CustomTreeItem(props, ref) {
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getLabelProps,
      getGroupTransitionProps,
      status,
      publicAPI,
    } = useTreeItem({ 
      id, 
      itemId, 
      children, 
      label, 
      disabled, 
      rootRef: ref 
    });

    const item = publicAPI.getItem(itemId) as TreeItemData;
    const color = item?.color;

    const handleItemClick = (event: React.MouseEvent) => {
      if (item?.onClick) {
        event.stopPropagation();
        item.onClick(item, event);
      }
    };

    return (
      <TreeItemProvider id={id} itemId={itemId}>
        <TreeItemRoot {...getRootProps(other)}>
          <TreeItemContent
            {...getContentProps({
              className: clsx('content', {
                expanded: status.expanded,
                selected: status.selected,
                focused: status.focused,
                disabled: status.disabled,
                clickable: !!item?.onClick,
              }),
              onClick: handleItemClick,
            })}
          >
            {status.expandable && (
              <TreeItemIconContainer {...getIconContainerProps()}>
                <TreeItemIcon status={status} />
              </TreeItemIconContainer>
            )}

            <CustomLabel {...getLabelProps({ color })} />
          </TreeItemContent>
          {children && (
            <TransitionComponent
              {...getGroupTransitionProps({ className: 'groupTransition' })}
            />
          )}
        </TreeItemRoot>
      </TreeItemProvider>
    );
  }
);

export default function CustomizedTreeView({
  items,
  title,
  defaultExpandedItems,
  defaultSelectedItems,
  multiSelect,
}: CustomizedTreeViewProps) {
  return (
    <Card
      variant="outlined"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        flexGrow: 1,
        maxWidth: 400,
        margin: 'auto'
      }}
    >
      <CardContent>
        {
            title &&
                <Typography component="h2" variant="subtitle2" sx={{ mb: 1 }}>
                    {title}
                </Typography>
        }
        <RichTreeView
          items={items}
          aria-label="customized tree view"
          multiSelect={multiSelect}
          defaultExpandedItems={defaultExpandedItems}
          defaultSelectedItems={defaultSelectedItems}
          sx={{
            m: '0 -8px',
            pb: '8px',
            height: 'fit-content',
            flexGrow: 1,
            overflowY: 'auto',
            '& .content': {
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.selected': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              },
              '&.focused': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: -2,
              },
            },
          }}
          slots={{ item: CustomTreeItem }}
        />
      </CardContent>
    </Card>
  );
}