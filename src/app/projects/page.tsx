import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Meus Projetos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projeto Exemplo 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Em breve você poderá gerenciar seus projetos aqui.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
