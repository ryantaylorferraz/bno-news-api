import { PrismaClient, ArticleStatus, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Retorna uma data N dias atrás a partir de agora.
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

async function main() {
  console.log('Iniciando seed...\n');

  // ── Usuário admin ──────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@bno.com.br' },
    update: {},
    create: { name: 'Admin BNO', email: 'admin@bno.com.br', passwordHash, role: Role.ADMIN },
  });
  console.log(`[user]     ${admin.email} (${admin.role})`);

  // ── Categorias ─────────────────────────────────────────────────────────────

  const categoriesData = [
    { name: 'Brasil',     slug: 'brasil',     order: 1 },
    { name: 'Mundo',      slug: 'mundo',      order: 2 },
    { name: 'Política',   slug: 'politica',   order: 3 },
    { name: 'Economia',   slug: 'economia',   order: 4 },
    { name: 'Tecnologia', slug: 'tecnologia', order: 5 },
    { name: 'Ciência',    slug: 'ciencia',    order: 6 },
    { name: 'Esportes',   slug: 'esportes',   order: 7 },
  ];

  const cat: Record<string, string> = {};   // slug → id

  for (const data of categoriesData) {
    const c = await prisma.category.upsert({
      where:  { slug: data.slug },
      update: {},
      create: data,
    });
    cat[data.slug] = c.id;
    console.log(`[category] ${c.name}`);
  }

  // ── Autores ────────────────────────────────────────────────────────────────

  const authorsData = [
    {
      slug:      'redacao-bno',
      name:      'Redação BNO',
      bio:       'Equipe de jornalismo da BNO News responsável pela cobertura geral.',
      role:      'Redação',
      active:    true,
    },
    {
      slug:      'ana-souza',
      name:      'Ana Souza',
      bio:       'Repórter especializada em política e economia.',
      role:      'Repórter',
      active:    true,
    },
    {
      slug:      'carlos-lima',
      name:      'Carlos Lima',
      bio:       'Correspondente de tecnologia e ciência.',
      role:      'Correspondente',
      active:    true,
    },
  ];

  const aut: Record<string, string> = {};   // slug → id

  for (const data of authorsData) {
    const a = await prisma.author.upsert({
      where:  { slug: data.slug },
      update: {},
      create: data,
    });
    aut[data.slug] = a.id;
    console.log(`[author]   ${a.name}`);
  }

  // ── Artigos ────────────────────────────────────────────────────────────────
  // Primeiros 4 da lista serão usados nos slots da home (hero + 3 destaques).

  // picsum.photos/seed/{string}/W/H → mesma seed = mesma imagem sempre (determinístico).
  const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/630`;

  const articlesData = [
    // ── publicados ──────────────────────────────────────────────────────────
    {
      slug:          'governo-anuncia-pacote-investimentos-infraestrutura',
      title:         'Governo anuncia pacote de R$ 50 bi em infraestrutura',
      chapeu:        'Economia',
      lead:          'Medidas preveem obras até 2026 com foco em mobilidade urbana e saneamento básico.',
      body:          'O governo federal anunciou um novo pacote de investimentos em infraestrutura no valor de R$ 50 bilhões. As obras têm previsão de conclusão até 2026 e são voltadas principalmente para mobilidade urbana, saneamento básico e conectividade em regiões remotas. O ministro responsável destacou que os contratos serão publicados no Diário Oficial nas próximas semanas.',
      coverImageUrl: img('bno-economia-infra'),
      status:        ArticleStatus.PUBLISHED,
      breaking:      true,
      publishedAt:   daysAgo(0),
      categorySlug:  'economia',
      authorSlug:    'ana-souza',
    },
    {
      slug:          'inteligencia-artificial-transforma-mercado-trabalho-brasil',
      title:         'IA transforma o mercado de trabalho no Brasil',
      chapeu:        'Tecnologia',
      lead:          'Pesquisa aponta que 40% das empresas brasileiras já usam inteligência artificial nos processos.',
      body:          'Um levantamento do Ipea revelou que a inteligência artificial já está presente em quatro de cada dez empresas brasileiras de médio e grande porte. Os setores mais impactados são financeiro, logística e saúde. Especialistas alertam para a necessidade de requalificação profissional em larga escala.',
      coverImageUrl: img('bno-tecnologia-ia'),
      status:        ArticleStatus.PUBLISHED,
      breaking:      false,
      publishedAt:   daysAgo(1),
      categorySlug:  'tecnologia',
      authorSlug:    'carlos-lima',
    },
    {
      slug:          'selecao-brasileira-divulga-lista-convocados-amistosos',
      title:         'Seleção divulga lista de convocados para amistosos',
      chapeu:        'Esportes',
      lead:          'Técnico chamou 26 jogadores para a preparação da Copa do Mundo 2026.',
      body:          'O técnico da seleção brasileira divulgou a lista com 26 nomes para os amistosos preparatórios da Copa do Mundo 2026. A convocação traz novidades no meio-campo e mantém os titulares tradicionais na defesa e no ataque. Os jogos acontecem na próxima semana.',
      coverImageUrl: img('bno-esportes-futebol'),
      status:        ArticleStatus.PUBLISHED,
      breaking:      false,
      publishedAt:   daysAgo(1),
      categorySlug:  'esportes',
      authorSlug:    'redacao-bno',
    },
    {
      slug:          'congresso-aprova-reforma-tributaria-em-votacao-historica',
      title:         'Congresso aprova reforma tributária em votação histórica',
      chapeu:        'Política',
      lead:          'Proposta unifica impostos federais e simplifica o sistema fiscal brasileiro.',
      body:          'O Congresso Nacional aprovou a reforma tributária com ampla maioria. A proposta unifica cinco tributos federais em um único imposto sobre valor agregado, seguindo o modelo europeu. A implementação será gradual ao longo de sete anos. Especialistas avaliam que a medida pode reduzir o custo burocrático das empresas em até 30%.',
      coverImageUrl: img('bno-politica-congresso'),
      status:        ArticleStatus.PUBLISHED,
      breaking:      false,
      publishedAt:   daysAgo(2),
      categorySlug:  'politica',
      authorSlug:    'ana-souza',
    },
    {
      slug:          'cientistas-descobrem-nova-especie-de-peixe-no-rio-negro',
      title:         'Cientistas descobrem nova espécie de peixe no Rio Negro',
      chapeu:        'Ciência',
      lead:          'Animal possui características únicas de bioluminescência ainda não documentadas.',
      body:          'Pesquisadores da UFAM anunciaram a descoberta de uma nova espécie de peixe no Rio Negro, na Amazônia. O animal mede cerca de 12 centímetros e emite luz azul por bioluminescência — mecanismo raro em peixes de água doce. O achado foi publicado na revista Nature e é considerado relevante para o estudo da biodiversidade amazônica.',
      coverImageUrl: img('bno-ciencia-amazonia'),
      status:        ArticleStatus.PUBLISHED,
      breaking:      false,
      publishedAt:   daysAgo(3),
      categorySlug:  'ciencia',
      authorSlug:    'carlos-lima',
    },
    {
      slug:          'brasil-assume-presidencia-g20-com-agenda-social',
      title:         'Brasil assume presidência do G20 com agenda social',
      chapeu:        'Brasil',
      lead:          'País prioriza debate sobre desigualdade e transição energética durante o mandato.',
      body:          'O Brasil assumiu formalmente a presidência rotativa do G20. A agenda brasileira coloca no centro das discussões o combate à pobreza extrema, a reforma dos organismos multilaterais e a transição energética justa. O presidente participou da cerimônia de abertura ao lado de líderes das principais economias do mundo.',
      coverImageUrl: img('bno-brasil-g20'),
      status:        ArticleStatus.PUBLISHED,
      breaking:      false,
      publishedAt:   daysAgo(4),
      categorySlug:  'brasil',
      authorSlug:    'redacao-bno',
    },
    {
      slug:          'onu-alerta-tensoes-crescentes-no-oriente-medio',
      title:         'ONU alerta para tensões crescentes no Oriente Médio',
      chapeu:        'Mundo',
      lead:          'Secretário-geral pede diálogo e reforço das missões de paz na região.',
      body:          'O secretário-geral da ONU emitiu alerta sobre o escalada de tensões no Oriente Médio e convocou reunião de emergência do Conselho de Segurança. Na declaração, ele pediu contenção a todas as partes e reafirmou o compromisso da organização com uma solução diplomática sustentável para os conflitos da região.',
      coverImageUrl: img('bno-mundo-diplomacia'),
      status:        ArticleStatus.PUBLISHED,
      breaking:      false,
      publishedAt:   daysAgo(5),
      categorySlug:  'mundo',
      authorSlug:    'redacao-bno',
    },
    // ── rascunhos (sem imagem — ainda não publicados) ─────────────────────────
    {
      slug:          'inflacao-desacelera-pelo-terceiro-mes-consecutivo',
      title:         'Inflação desacelera pelo terceiro mês consecutivo',
      chapeu:        'Economia',
      lead:          'IPCA registra queda e banco central avalia novo ciclo de redução dos juros.',
      body:          'Os dados do IBGE confirmaram nova desaceleração da inflação. O IPCA ficou abaixo das projeções do mercado pelo terceiro mês seguido, abrindo espaço para que o Comitê de Política Monetária (Copom) avalie uma redução na taxa básica de juros na próxima reunião.',
      coverImageUrl: null,
      status:        ArticleStatus.DRAFT,
      breaking:      false,
      publishedAt:   null,
      categorySlug:  'economia',
      authorSlug:    'ana-souza',
    },
    {
      slug:          'novo-satelite-brasileiro-e-lancado-com-sucesso',
      title:         'Novo satélite brasileiro é lançado com sucesso',
      chapeu:        'Ciência',
      lead:          'Missão vai monitorar o desmatamento da Amazônia com resolução inédita.',
      body:          'A Agência Espacial Brasileira confirmou o lançamento bem-sucedido do satélite SGDC-2. O equipamento orbita a 36 mil quilômetros de altitude e vai fornecer imagens de alta resolução da cobertura florestal brasileira. Os dados serão disponibilizados ao público e a organismos internacionais.',
      coverImageUrl: null,
      status:        ArticleStatus.DRAFT,
      breaking:      false,
      publishedAt:   null,
      categorySlug:  'ciencia',
      authorSlug:    'carlos-lima',
    },
  ];

  const articleIds: string[] = [];

  for (const { categorySlug, authorSlug, ...data } of articlesData) {
    const article = await prisma.article.upsert({
      where:  { slug: data.slug },
      // Atualiza apenas coverImageUrl para não sobrescrever edições manuais.
      update: { coverImageUrl: data.coverImageUrl },
      create: {
        ...data,
        categoryId: cat[categorySlug],
        authorId:   aut[authorSlug],
      },
    });
    articleIds.push(article.id);
    console.log(`[article]  [${article.status}] ${article.title}`);
  }

  // ── Slots da home ──────────────────────────────────────────────────────────
  // hero → artigo breaking mais recente; highlights → próximos 3 publicados.

  const slotsData = [
    { slotKey: 'hero',        articleId: articleIds[0] },
    { slotKey: 'highlight_1', articleId: articleIds[1] },
    { slotKey: 'highlight_2', articleId: articleIds[2] },
    { slotKey: 'highlight_3', articleId: articleIds[3] },
  ];

  for (const data of slotsData) {
    await prisma.featuredSlot.upsert({
      where:  { slotKey: data.slotKey },
      update: { articleId: data.articleId },
      create: data,
    });
    console.log(`[slot]     ${data.slotKey}`);
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  const settingsData = [
    { key: 'site_name',        value: 'BNO News' },
    { key: 'site_description', value: 'Notícias do Brasil e do Mundo' },
    { key: 'contact_email',    value: 'contato@bno.com.br' },
  ];

  for (const data of settingsData) {
    await prisma.setting.upsert({
      where:  { key: data.key },
      update: {},
      create: data,
    });
    console.log(`[setting]  ${data.key}`);
  }

  console.log('\nSeed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
