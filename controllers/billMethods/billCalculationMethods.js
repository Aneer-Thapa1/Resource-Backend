// Function to calculate total amount based on bill type
function calculateTotalAmount(billItems, calculationType) {
  return billItems.reduce((sum, item) => {
    if (calculationType === 'VAT') {
      return sum + (item.withVATAmount || 0); // Sum up VAT amounts
    } else if (calculationType === 'NOBILL') {
      return sum + item.unit_price * item.quantity; // Sum for NOBILL
    } else {
      return sum + item.unit_price * item.quantity; 
    }
  }, 0);
}

// Common function used for both PAN and VAT calculations
function commonCalculation(billItems, paid_amount, res, calculationType) {
  let totalSumAmount = calculateTotalAmount(billItems, calculationType);

  // Check if the paid amount is greater than the total amount for PAN or NOBILL
  if (totalSumAmount < paid_amount) {
    return res.status(400).json({
      error: "Paid amount cannot be greater than the actual amount!",
    });
  }

  // General calculation for PAN and NOBILL
  const pendingAmount = totalSumAmount - (paid_amount || 0);
  return { totalSumAmount, pendingAmount };
}

// VAT calculation handler
function vatCalculationHandler(billItems, paid_amount, res) {
  // Calculate the total VAT amount
  const totalVATAmount = calculateTotalAmount(billItems, 'VAT');

    console.log(totalVATAmount);
  // Check if the paid amount is greater than the total VAT amount
  if (totalVATAmount < paid_amount) {
    return res.status(400).json({
      error: "Paid amount cannot be greater than the total VAT amount!",
    });
  }

  // Calculate the pending amount for VAT
  const pendingAmount = totalVATAmount - (paid_amount || 0);

  return { totalSumAmount: totalVATAmount, pendingAmount };
}

// PAN calculation handler
function panCalculationHandler(billItems, paid_amount, res) {
  return commonCalculation(billItems, paid_amount, res, 'PAN');
}

// No Bill calculation handler
function noBillCalculation(billItems, paid_amount, res) {
  return commonCalculation(billItems, paid_amount, res, 'NOBILL');
}

// TDS calculation based on type (VAT or PAN)
function tdsCalculation(total_amount, TDS, bill_type) {
  if (bill_type === 'VAT') {
    if (TDS === 1.5) {
      return total_amount * 0.015; 
    } else if (TDS === 0) {
      return 0;
    }
  } else if (bill_type === 'PAN') {
    switch (TDS) {
      case 10:
        return total_amount * 0.1; 
      case 15:
        return total_amount * 0.15; 
      case 0:
        return 0; 
      default:
        throw new Error("Invalid PAN TDS percentage");
    }
  }
  throw new Error("Invalid TDS percentage");
}

// VAT calculation function
function vatCalculation(total_amount, percentage) {
  return total_amount + (total_amount * percentage);   
}

module.exports = {
  vatCalculationHandler,
  panCalculationHandler,
  noBillCalculation,
  tdsCalculation,
  vatCalculation,
};
