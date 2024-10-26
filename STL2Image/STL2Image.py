from stl import mesh
from mpl_toolkits import mplot3d
from matplotlib import pyplot

def stlToImage(path):
    # Create a new plot
    figure = pyplot.figure()
    axes = figure.add_subplot(projection='3d')

    # Load the STL files and add the vectors to the plot 
    # file is at https://github.com/wolph/numpy-stl/tree/develop/tests/stl_binary
    your_mesh = mesh.Mesh.from_file(path)
    axes.add_collection3d(mplot3d.art3d.Poly3DCollection(your_mesh.vectors))

    # Auto scale to the mesh size
    scale = your_mesh.points.flatten()
    axes.auto_scale_xyz(scale, scale, scale)

    # Show the plot to the screen
    #pyplot.show()
    pyplot.savefig('outputImages/model.jpg', format='jpg', bbox_inches='tight')

path = '/Users/siddhantagarwal/Desktop/CADabra/STL2Image/exampleSTLs/exampleStl.stl'
stlToImage(path)