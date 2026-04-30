const stripeFormAppearance = {
  variables: {
    colorPrimary: '#1a202c',
    colorBackground: 'rgb(243, 238, 232)',
    colorText: '#1a202c',
    colorDanger: '#ef4444',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '0px',
  },
  rules: {
    '.Input': {
      padding: '10px',
      backgroundColor: 'white',
      border: 'none',
      borderRadius: '0px',
      color: '#1a202c',
      boxShadow: 'none',
    },
    '.Input:focus': {
      borderColor: '#1a202c',
      boxShadow: '0 0 0 1px #1a202c',
    },
    '.Label': {
      color: '#374151',
      fontWeight: '500',
    },
    '.Tab': {
      backgroundColor: 'transparent',
      border: '1px solid #e2e8f0',
      color: '#6b7280',
    },
    '.Tab:hover': {
      backgroundColor: '#f9fafb',
      color: '#374151',
    },
    '.Tab--selected': {
      backgroundColor: 'white',
      borderColor: '#1a202c',
      color: '#1a202c',
    },
    '.Elements': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '.PaymentElement': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '.StripeElement': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '.p-PaymentElement': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '.p-AccordionPanel': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '.p-AccordionPanelContents': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '.p-Accordion': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '.AccordionItem': {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
  },
};

export default stripeFormAppearance;
