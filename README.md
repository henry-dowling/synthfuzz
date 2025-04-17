# How to collaborate

1. Install Jupytext with pip install jupytext
2. Add *.ipynb to your local .gitignore file
3. When you've pulled the latest version of the .py notebook from Github, open the file as a notebook in Jupyer (right-click in Jupyter Lab)
4. Once you're done editing the notebook, the updated SynthFuzz2.py file should be automatically updated to match the edits made to the .ipynb file. 
5. To add the notebook to version control, push the .ipynb file.
6. Do not edit the .py notebook, instead think of it as a transpiled version of the .ipynb that's more friendly for us to send to version control.
7. Before you commit, run sync command