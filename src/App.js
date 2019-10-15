import React from 'react';
import { Table } from 'react-bootstrap';
import './App.css';
import CarLoanCalculator from './car_loan_calculator';

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

const initialCar = {
  cost: 12000,
  extraPayment: 0,
  interestRate: 3.25,
  loanEndDate: "",
  monthPurchased: "Sept",
  yearPurchased: 2019,
  numOfExtraPayments: 0,
  monthlyPayment: 0,
  refinancedDate: "",
  refinancedAmount: 0,
  refinancedMonthlyPayment: 0
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: [{
        id: 1,
        ...initialCar
      }],
      selectedCarId: 1,
      profitPerCar: 200
    }
  }

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

  getCar = (id) => this.state.cars.find(car => car.id === id);

  getCarLoanEndDate(id) {
    const { cars } = this.state;
    const car = this.getCar(id);

    let currentMonthIndex = months.findIndex(m => m === car.monthPurchased);
    let year = car.yearPurchased;
    const interestRate = car.interestRate / 100;
    let principalAmount = parseInt(car.cost);

    let originalMonthlyPayment = Math.round(-this.PMT(interestRate/12, 60, principalAmount));
    let refinancedMonthlyPayment = 0;

    let monthIndex = currentMonthIndex % 12;
    let numPayments = 0;
    let extraPayments = parseInt(car.extraPayment);
    if ( parseInt(car.numOfExtraPayments) === 0) car.monthlyPayment = originalMonthlyPayment;

    while(principalAmount > 0) {
      monthIndex = currentMonthIndex % 12;
      if (numPayments >= parseInt(car.numOfExtraPayments) && originalMonthlyPayment !== 0 && parseInt(car.numOfExtraPayments) !== 0) {
        extraPayments = 0;
        car.refinancedDate = [months[monthIndex], year].join(" ");
        car.refinancedAmount = principalAmount;
        refinancedMonthlyPayment = Math.round(-this.PMT(interestRate/12, 60, principalAmount));
        car.refinancedMonthlyPayment = refinancedMonthlyPayment
        car.monthlyPayment = originalMonthlyPayment;
        originalMonthlyPayment = 0;
      }

      const interestPaid = Math.round(principalAmount * interestRate/12);
      const principalPaid = (originalMonthlyPayment + refinancedMonthlyPayment) - interestPaid;
      principalAmount -= principalPaid + extraPayments;
      currentMonthIndex++;
      if(monthIndex === 11 && principalAmount > 0) year++;
      numPayments++;
    }

    const otherCars = cars.filter(car => car.id !== id);
    this.setState({
      cars: otherCars.concat(car).sort((a,b) => a.id - b.id)
    });

    return [months[monthIndex], year]
  }

  handleCarValueChange = (id, e) => {
    const { cars } = this.state;

    const otherCars = cars.filter(car => car.id !== id);

    let car = this.getCar(id);
    car[e.target.name] = e.target.value;

    this.setState({
      cars: otherCars.concat(car).sort((a,b) => a.id - b.id),
      selectedCarId: null
    });
  };

  addNewCar = () => {
    const { cars, profitPerCar } = this.state;
    const totalProfit = profitPerCar * cars.length;

    const lastCar = cars[cars.length - 1];

    let totalPayments = 0;
    cars.forEach(car => totalPayments += car.refinancedMonthlyPayment);

    const newCar = {
      id: cars[cars.length -1].id +1,
      ...initialCar,
      extraPayment: totalProfit - totalPayments
    }

    let refinancedDate = lastCar.refinancedDate.split(" ");

    if(refinancedDate.length === 2) {
      newCar.monthPurchased = refinancedDate[0];
      newCar.yearPurchased = refinancedDate[1];
    }

    this.setState(prevState => ({
       cars: [...prevState.cars, newCar],
       selectedCarId: null
    }));
  }

  handleCalculateCarLoanEndDate = (id) => {
    const { cars } = this.state;

    const otherCars = cars.filter(car => car.id !== id);

    let car = this.getCar(id);
    car.loanEndDate = this.getCarLoanEndDate(id);

    this.setState({
      cars: otherCars.concat(car).sort((a,b) => a.id - b.id),
      selectedCarId: car.id,
    });
  }

  renderMonthsOptions = () => {
    return (
      months.map(month => {
        return(<option value={month}>{month}</option>);
      })
    );
  }

  renderCars() {
    const { cars } = this.state;

    let carRows = [];
    carRows = cars.map(car => {
      return(
      <tr>
        <td>
        <textarea value={car.cost} name="cost" onChange={(e) => this.handleCarValueChange(car.id, e)} />
        </td>
        <td>
        <textarea value={car.interestRate} name="interestRate" onChange={(e) => this.handleCarValueChange(car.id, e)} />
        </td>
        <td>
          <select value={car.monthPurchased} name="monthPurchased" onChange={(e) => this.handleCarValueChange(car.id, e)}>
            {this.renderMonthsOptions()}
            </select>
        </td>
        <td><textarea value={car.yearPurchased} name="yearPurchased" onChange={(e) => this.handleCarValueChange(car.id, e)} /></td>
        <td>{car.monthlyPayment}</td>
        <td><textarea value={car.extraPayment} name="extraPayment" onChange={(e) => this.handleCarValueChange(car.id, e)} /></td>
        <td><textarea value={car.numOfExtraPayments} name="numOfExtraPayments" onChange={(e) => this.handleCarValueChange(car.id, e)} /></td>
        <td>{car.refinancedDate}</td>
        <td>{car.refinancedMonthlyPayment}</td>
        <td>{car.refinancedAmount}</td>
        <td>
          <div>
            {car.loanEndDate}
          <button className="pl-1" onClick={() => this.handleCalculateCarLoanEndDate(car.id)}>Calculate Loan</button>
          </div>
        </td>
      </tr>
      );
    });
    return carRows;
  }

  render() {
    const { selectedCarId, cars, profitPerCar } = this.state;
    const selectedCar = this.getCar(selectedCarId);

    return (
      <div className="App">
        <div className="d-inline-flex">
          <Table className="table">
            <thead>
              <tr>
                <th>Cost</th>
                <th>Interest Rate</th>
                <th>Month Purchased</th>
                <th>Year Purchased</th>
                <th>Monthly Payment</th>
                <th>Extra Payment</th>
                <th># Extra Payments</th>
                <th>Refinanced Date</th>
                <th>Refinanced Payment</th>
                <th>Refinanced Amount</th>
                <th>Car Loan End Date</th>
              </tr>
            </thead>
          <tbody>{this.renderCars()}</tbody>
          </Table>
          <Table className="getaround-summary">
            <thead>
              <tr>
                <th>Number of Cars</th>
                <th>Profit</th>
                <th>Total Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{cars.length}</th>
                <td><textarea value={profitPerCar} name="numOfExtraPayments" onChange={(e) => this.setState({ profitPerCar: parseInt(e.target.value || 0)}) }/></td>
                <th>{cars.length * (profitPerCar || 0)}</th>
              </tr>
            </tbody>
          </Table>
        </div>
        <button className="primary" onClick={this.addNewCar}>Add new Car</button>
        {selectedCarId && <CarLoanCalculator car={selectedCar} /> }
      </div>
    );
  }
}
