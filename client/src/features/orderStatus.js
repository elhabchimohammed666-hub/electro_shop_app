const orderStatusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée'
};

export function orderStatusLabel(status) {
  return orderStatusLabels[status] || status;
}
