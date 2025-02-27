import styled from 'styled-components';
import { Grid } from '@material-ui/core';
import colors from '../../constants/colors';

export const IncomeTitle = styled.span`
  color: ${colors.blackText};
  font-size: 9px;
  text-transform: uppercase;
`;

export const IncomeValue = styled.span`
  color: ${props => props.color};
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
`;

export const Container = styled(Grid)`
  display: flex;
  flex-direction: column;
`;