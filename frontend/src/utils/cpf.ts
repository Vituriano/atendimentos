/**
 * mode 'full'    → '***.***.***-**'  (Pacientes — completamente opaco, LGPD)
 * mode 'partial' → '123.***.***-10'  (Fila — mantém 3 primeiros e 2 últimos)
 */
export function maskCpf(cpf: string, mode: 'full' | 'partial' = 'full'): string {
  if (mode === 'partial') {
    return cpf.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, '$1.***.***-$2') || cpf
  }
  return cpf.replace(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, '***.***.***-**') || cpf
}
