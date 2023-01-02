export const normalizeAddress = (address) => {
  if (!(!!address)) return null; //throw new Error('');
  
  let addr = address.toString();
  
  addr = addr.includes(',') ? addr.replace(',', '_') : address;
  
  return addr
}