

export function generateCode():string {
  const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += crockford[Math.floor(Math.random() * crockford.length)];
  }
  return code;
}