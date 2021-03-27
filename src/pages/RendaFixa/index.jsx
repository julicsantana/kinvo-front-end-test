import React, { useState, useEffect } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { Grid } from '@material-ui/core';
import RendaFixaService from '../../services/RendaFixaService';
import CardInfo from '../../components/CardInfo';
import InfoTag from '../../components/InfoTag';
import IncomeCard from '../../components/IncomeCard';
import Select from '../../components/FormElements/Select';
import TextField from '../../components/FormElements/TextField';
import colors from '../../utils/colors';
import {
  Container,
  Title,
  IncomeName,
  IncomeInfo,
  IncomeTitle,
  IncomeValue,
  IncomeContent,
  CardRow,
  MyFixedIncomeHeader,
  MyFixedIncomeFooter,
  Pagination,
} from './styles';

function RendaFixa() {
  const [ fixedIncomeData, setFixedIncomeData ] = useState();
  const { snapshotByProduct, snapshotByPortfolio, dailyEquityByPortfolioChartData } = fixedIncomeData || {};

  useEffect(() => {
    if (!fixedIncomeData) {
      getFixedIncomeData();
    }
  })

  async function getFixedIncomeData() {
    try {
      const data = await RendaFixaService.getAll();
      setFixedIncomeData(data);
    } catch (error) {
      
    }
  }

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Title>Renda Fixa</Title>
        </Grid>

        <Grid item xs={12}>
          <MyFixedIncomePortfolio snapshotByPortfolio={snapshotByPortfolio} />
        </Grid>

        <Grid item xs={12}>
          <CardInfo title="Rentabilidade dos Títulos" />
        </Grid>

        <Grid item xs={12}>
          <MyFixedIncomesList snapshotByProduct={snapshotByProduct} />
        </Grid>

        <Grid item xs={6}>
          <CardInfo titleBorder title="Divisão de Carteira por Tipos" />
        </Grid>

        <Grid item xs={6}>
          <CardInfo titleBorder title="Divisão de Carteira por Título" />
        </Grid>
      </Grid>
    </Container>
  )
}

function MyFixedIncomePortfolio(props) {
  const { snapshotByPortfolio } = props;
  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <InfoTag title="Saldo Bruto" subtitle={snapshotByPortfolio?.equity} prefix="R$" />
      </Grid>
      <Grid item xs={2}>
        <InfoTag title="Valor Aplicado" subtitle={snapshotByPortfolio?.valueApplied} prefix="R$" />
      </Grid>
      <Grid item xs={2}>
        <InfoTag title="Resultado" subtitle={snapshotByPortfolio?.equityProfit} prefix="R$" />
      </Grid>
      <Grid item xs={2}>
        <InfoTag title="Rentabilidade" subtitle={snapshotByPortfolio?.percentageProfit} sufix="%" />
      </Grid>
      <Grid item xs={2}>
        <InfoTag title="CDI" subtitle={snapshotByPortfolio?.indexerValue} sufix="%" />
      </Grid>
      <Grid item xs={2}>
        <InfoTag title="% Sobre CDI" subtitle={snapshotByPortfolio?.percentageOverIndexer} sufix="%" />
      </Grid>
    </Grid>
  );
}

function MyFixedIncomesList(props) {
  const { snapshotByProduct } = props;
  const [ filteredProducts, setFilteredProducts ] = useState(snapshotByProduct);
  const [ listCurrentPage, setListCurrentPage ] = useState(snapshotByProduct);
  const [ orderOption, setOrderOption ] = useState();
  const [ searchValue, setSearchValue ] = useState();
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ count, setCount ] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    if (currentPage && filteredProducts?.length) {
      const firstItem = ((currentPage - 1)*(recordsPerPage));
      const lastItem = ((currentPage)*(recordsPerPage) - 1);
      const sliced = filteredProducts?.slice(firstItem, lastItem + 1);
      setListCurrentPage(sliced);
    }
  },[currentPage, filteredProducts])

  useEffect(() => {
    if (filteredProducts) {
      const count = Math.ceil(filteredProducts?.length/recordsPerPage);
      setCount(count);
    }
  },[filteredProducts])

  useEffect(() => {
    if (count) {
      setCurrentPage(1);
    }
  },[count])

  useEffect(() => {
    if (searchValue) {
      const filtered = snapshotByProduct?.filter((product) => {
        const { name, bondType } = product.fixedIncome;
        const searchByName = name.toLowerCase().includes(searchValue.toLowerCase());
        const searchByBondType = bondType.toLowerCase().includes(searchValue.toLowerCase());
        return searchByName || searchByBondType;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(snapshotByProduct);
    }
  },[searchValue, snapshotByProduct])

  const headerOptions = (
    <MyFixedIncomeHeader container spacing={2}>
      <Grid item xs={3}>
        <Select
          value={orderOption}
          onChange={setOrderOption}
          label="Ordenar por"
          options={[]}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          value={searchValue}
          onChange={setSearchValue}
          icon={<AiOutlineSearch />}
        />
      </Grid>
    </MyFixedIncomeHeader>
  );

  const footerOptions = (
    <MyFixedIncomeFooter>
      <Pagination
        count={count}
        variant="outlined"
        shape="rounded"
        onChange={(e, page) => setCurrentPage(page)}
      />
    </MyFixedIncomeFooter>
  );

  return (
    <CardInfo
      titleBorder
      title="Minhas Rendas Fixas"
      headerOptions={headerOptions}
      footerOptions={footerOptions}
    >
      {listCurrentPage?.map((product, index) => (
        <CardRow key={index} index={index}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <IncomeCard title="Título">
                <IncomeContent>
                  <Grid item xs={6}>
                    <IncomeName>{product.fixedIncome.name}</IncomeName>
                  </Grid>
                  <IncomeInfo>
                    <IncomeTitle>Classe</IncomeTitle>
                    <IncomeValue color={colors.lightPurple}>{product.fixedIncome.bondType}</IncomeValue>
                  </IncomeInfo>
                </IncomeContent>
              </IncomeCard>
            </Grid>
            
            <Grid item xs={5}>
              <IncomeCard title="Minha Posição">
                <IncomeContent>
                  <IncomeInfo>
                    <IncomeTitle>Valor Inves.</IncomeTitle>
                    <IncomeValue color={colors.green}>{product.position.valueApplied}</IncomeValue>
                  </IncomeInfo>
                  <IncomeInfo>
                    <IncomeTitle>Saldo Bruto</IncomeTitle>
                    <IncomeValue color={colors.green}>{product.position.equity}</IncomeValue>
                  </IncomeInfo>
                  <IncomeInfo>
                    <IncomeTitle>Rent.</IncomeTitle>
                    <IncomeValue color={colors.green}>{product.position.profitability}</IncomeValue>
                  </IncomeInfo>
                  <IncomeInfo>
                    <IncomeTitle>% da cart.</IncomeTitle>
                    <IncomeValue color={colors.green}>{product.position.portfolioPercentage}</IncomeValue>
                  </IncomeInfo>
                  <IncomeInfo>
                    <IncomeTitle>{product.position.indexerLabel}</IncomeTitle>
                    <IncomeValue color={colors.green}>{product.position.indexerValue}</IncomeValue>
                  </IncomeInfo>
                  <IncomeInfo>
                    <IncomeTitle>Sobre {product.position.indexerLabel}</IncomeTitle>
                    <IncomeValue color={colors.green}>{product.position.percentageOverIndexer}</IncomeValue>
                  </IncomeInfo>
                </IncomeContent>
              </IncomeCard>
            </Grid>
            
            <Grid item xs={3}>
              <IncomeCard title="Vencimento">
                <IncomeContent>
                  <IncomeInfo item style={{ flex: 1, justifyContent: 'center' }}>
                    <IncomeTitle>Data Venc.</IncomeTitle>
                    <IncomeValue color={colors.blue}>{product.due.date}</IncomeValue>
                  </IncomeInfo>
                  <IncomeInfo item style={{ flex: 1, justifyContent: 'center' }}>
                    <IncomeTitle>Dias até venc.</IncomeTitle>
                    <IncomeValue color={colors.blue}>{product.due.daysUntilExpiration}</IncomeValue>
                  </IncomeInfo>
                </IncomeContent>
              </IncomeCard>
            </Grid>
          </Grid>
        </CardRow>
      ))}
    </CardInfo>
  );
}

export default RendaFixa;