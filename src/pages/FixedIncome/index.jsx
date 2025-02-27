import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';

import CardInfo from '../../components/CardInfo';
import InfoTag from '../../components/InfoTag';
import DonutChart from '../../components/ChartElements/DonutChart';

import RendaFixaService from '../../services/FixedIncomeService';

import MyFixedIncomesList from './MyFixedIncomesList';
import { Container, Title } from './styles';
import AreaChart from '../../components/ChartElements/AreaChart';


function FixedIncome() {
  const [ fixedIncomeData, setFixedIncomeData ] = useState();
  const [ chartDataByName, setChartDataByName ] = useState();
  const [ chartDataByBondType, setChartDataByBondType ] = useState();
  const [ chartDataProfitability, setChartDataProfitability ] = useState();
  const { snapshotByProduct, snapshotByPortfolio } = fixedIncomeData || {};

  useEffect(() => {
    if (fixedIncomeData) {
      getChartDataByName();
      getChartDataByBondType();
      getDataForChart();
    } else {
      getFixedIncomeData();
    }
  }, [fixedIncomeData])

  async function getFixedIncomeData() {
    try {
      const data = await RendaFixaService.getAll();
      setFixedIncomeData(data);
    } catch (error) {
      console.error(error);
    }
  }

  function calculate(quotaInit, correctedQuota) {
    const percentage = quotaInit > 0 ? (correctedQuota - quotaInit)*100/quotaInit : 0;
    return Number(percentage.toFixed(2));
  }

  function getDataByProduct(array) {
    let quotaInit = 0;
    const data = array.map((element) => {
      const { movementTypeId, correctedQuota, dailyReferenceDate } = element;
      if (movementTypeId === 1) quotaInit = correctedQuota;
      if (quotaInit > 0) return [dailyReferenceDate, calculate(quotaInit, correctedQuota)]
    });
    return data;
  }

  function getDataForChart() {
    const { dailyEquityByPortfolioChartData } = fixedIncomeData;
    const group = groupBy(dailyEquityByPortfolioChartData, 'productName');
    const dataGrouped = [];

    Object.entries(group).forEach(([key, value]) => {
      dataGrouped.push({
        name: key,
        data: getDataByProduct(value),
      })
    })

    setChartDataProfitability(dataGrouped);
  }

  function getChartDataByName() {
    const { snapshotByProduct } = fixedIncomeData;
    const data = snapshotByProduct.map((product) => ({ name: product.fixedIncome.name, y: product.position.portfolioPercentage }));
    setChartDataByName(data);
  }

  function getChartDataByBondType() {
    const { snapshotByProduct } = fixedIncomeData;
    const group = [];
    snapshotByProduct.forEach((product) => {
      const { fixedIncome, position } = product;
      group[fixedIncome.bondType] = group[fixedIncome.bondType] ? group[fixedIncome.bondType] + position.portfolioPercentage : position.portfolioPercentage;
    });
    const dataGrouped = Object.entries(group).map(([key, value]) => (
      { name: key, y: value }
    ));
    setChartDataByBondType(dataGrouped);
  }

  const groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Title>Renda Fixa</Title>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <InfoTag title="Saldo Bruto" subtitle={snapshotByPortfolio?.equity} prefix="R$" />
            <InfoTag title="Valor Aplicado" subtitle={snapshotByPortfolio?.valueApplied} prefix="R$" />
            <InfoTag title="Resultado" subtitle={snapshotByPortfolio?.equityProfit} prefix="R$" />
            <InfoTag title="Rentabilidade" subtitle={snapshotByPortfolio?.percentageProfit} sufix="%" />
            <InfoTag title="CDI" subtitle={snapshotByPortfolio?.indexerValue} sufix="%" />
            <InfoTag title="% Sobre CDI" subtitle={snapshotByPortfolio?.percentageOverIndexer} sufix="%" />
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <CardInfo title="Rentabilidade dos Títulos">
            <AreaChart data={chartDataProfitability} />
          </CardInfo>
        </Grid>

        <Grid item xs={12}>
          <MyFixedIncomesList snapshotByProduct={snapshotByProduct} />
        </Grid>

        <Grid item xs={6}>
          <CardInfo titleBorder title="Divisão de Carteira por Tipos">
            <DonutChart label="% do Tipo" data={chartDataByBondType} />
          </CardInfo>
        </Grid>

        <Grid item xs={6}>
          <CardInfo titleBorder title="Divisão de Carteira por Título">
            <DonutChart label="% do Título" data={chartDataByName} />
          </CardInfo>
        </Grid>
      </Grid>
    </Container>
  )
}

export default FixedIncome;