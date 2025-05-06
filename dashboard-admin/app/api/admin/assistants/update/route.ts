import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateAssistant, getAssistant, SUPPORTED_MODELS } from '@/lib/vector-store-utils';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function PUT(request: Request) {
  try {
    const { project_id, instructions, model } = await request.json();

    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Au moins l'un des deux paramètres est nécessaire
    if (instructions === undefined && model === undefined) {
      return NextResponse.json({ error: 'Instructions ou modèle requis pour la mise à jour' }, { status: 400 });
    }

    // Vérifier si le modèle est supporté
    if (model && !SUPPORTED_MODELS.includes(model)) {
      return NextResponse.json({ 
        error: `Le modèle ${model} n'est pas supporté. Modèles disponibles: ${SUPPORTED_MODELS.join(', ')}` 
      }, { status: 400 });
    }

    // Récupérer l'ID de l'assistant associé au projet
    const { data: assistantData, error: assistantError } = await supabase
      .from('assistants')
      .select('openai_assistant_id')
      .eq('project_id', project_id)
      .single();

    if (assistantError || !assistantData?.openai_assistant_id) {
      return NextResponse.json({ error: 'Aucun assistant trouvé pour ce projet' }, { status: 404 });
    }

    // Mettre à jour l'assistant via l'API OpenAI
    const updatedAssistant = await updateAssistant(
      assistantData.openai_assistant_id,
      instructions,
      model
    );

    // Si le modèle a été mis à jour, mettre à jour la base de données
    if (model) {
      const { error: updateError } = await supabase
        .from('assistants')
        .update({ model: updatedAssistant.model })
        .eq('openai_assistant_id', assistantData.openai_assistant_id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du modèle dans la base de données:', updateError);
        // On continue malgré l'erreur car l'assistant a été mis à jour avec succès
      }
    }

    return NextResponse.json({
      message: 'Assistant mis à jour avec succès',
      assistant: updatedAssistant
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'assistant:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'assistant' 
    }, { status: 500 });
  }
}