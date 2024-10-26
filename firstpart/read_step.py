import cadquery as cq

result = cq.importers.importStep("text-to-cad-output.step")

print(result.vals())