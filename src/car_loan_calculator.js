import React from 'react';
import { Table } from 'react-bootstrap';
import './App.css';

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "October",
  "Nov",
  "Dec"
];

export default class CarLoanCalculator extends React.Component {
  PMT = (ir, np, pv, fv=0, type=0) => {
    /*
     * ir   - interest rate per month
     * np   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    var pmt, pvif;

    fv || (fv = 0);
    type || (type = 0);

    if (ir === 0)
        return -(pv + fv)/np;

    pvif = Math.pow(1 + ir, np);
    pmt = - ir * pv * (pvif + fv) / (pvif - 1);

    if (type === 1)
        pmt /= (1 + ir);

    return pmt;
  }

  renderCarLoans() {
    const { car } = this.props;
    let currentMonthIndex = months.findIndex(m => m === car.monthPurchased);
    let year = car.yearPurchased;
    const interestRate = car.interestRate / 100;
    let principalAmount = car.cost;
    const monthlyPayment = Math.round(-this.PMT(interestRate/12, 60, principalAmount));
    let extraPayment = parseInt(car.extraPayment) || 0;
    const carLoanRows = [];
    let numPayments = 0;
    while(principalAmount > 0) {
      if(numPayments >= parseInt(car.numOfExtraPayments)) extraPayment = 0;
      let monthIndex = currentMonthIndex % 12;

      // compute the monthly payment figure
      const interestPaid = Math.round(principalAmount * interestRate/12);
      const principalPaid = monthlyPayment - interestPaid;
      carLoanRows.push(
        <tr>
          <th>{months[monthIndex]}</th>
          <th>{year}</th>
          <th>{monthlyPayment}</th>
          <th>{interestPaid}</th>
          <th>{principalPaid}</th>
          <th>{extraPayment}</th>
          <th>{principalAmount - principalPaid - extraPayment}</th>
        </tr>
      )
      principalAmount -= principalPaid + extraPayment;
      currentMonthIndex++;
      numPayments++;
      if(monthIndex === 11) year++;
    }
    return carLoanRows;
  }

  render() {
    return(
      <Table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Monthly Payment</th>
            <th>Interest Paid</th>
            <th>Principal Paid</th>
            <th>Additional Payment</th>
            <th>Principal Balance</th>
          </tr>
        </thead>
        <tbody>{this.renderCarLoans()}</tbody>
      </Table>
    );
  }
}